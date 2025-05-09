import { Router } from 'express';
import { createCheckoutSession, createPortalSession, stripe } from '../../services/stripe';
import { authenticate } from '../../auth/middleware/auth.middleware';
import { Request } from 'express';
import { PrismaClient, SubscriptionPlan } from '@prisma/client';
import { Stripe } from 'stripe';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

interface StripeSubscription extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
}

const router = Router();

// Helper function to map price ID to plan
function getPlanFromPriceId(priceId: string): SubscriptionPlan {
  // Basic Plan
  if (priceId === 'price_1RMRn3SAkgq2mdwxabGYI0No' || // Basic Monthly
      priceId === 'price_1RMRnTSAkgq2mdwxMOZharFy') { // Basic Yearly
    return SubscriptionPlan.BASIC;
  }
  
  // Advanced/Pro Plan
  if (priceId === 'price_1RMRqxSAkgq2mdwxvkqKqSxw' || // Pro Monthly
      priceId === 'price_1RMRqxSAkgq2mdwxQMGyRTub') { // Pro Yearly
    return SubscriptionPlan.ADVANCED;
  }
  
  // Enterprise Plan
  if (priceId === 'price_1RMRtWSAkgq2mdwxNxnbUbZ5' || // Enterprise Monthly
      priceId === 'price_1RMRtWSAkgq2mdwxGL1xXAzv') { // Enterprise Yearly
    return SubscriptionPlan.ENTERPRISE;
  }

  throw new Error('Invalid price ID');
}

// Create a checkout session
router.post('/create-checkout-session', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    const userId = req.user?.id;

    console.log('Received checkout session request:', { priceId, userId, successUrl, cancelUrl });

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!priceId) {
      console.error('No price ID provided in request');
      return res.status(400).json({ error: 'Price ID is required' });
    }

    // Get or create Stripe customer
    const customer = await stripe.customers.create({
      metadata: {
        userId: userId,
      },
    });

    console.log('Created/retrieved customer:', customer.id);

    // Get the plan from price ID
    const plan = getPlanFromPriceId(priceId);

    // Store or update the customer ID in the database
    await prisma.subscription.upsert({
      where: {
        userId: userId,
      },
      update: {
        stripeCustomerId: customer.id,
        stripePriceId: priceId,
        plan: plan,
      },
      create: {
        userId: userId,
        stripeCustomerId: customer.id,
        stripePriceId: priceId,
        plan: plan,
        status: 'INACTIVE',
      },
    });

    const session = await createCheckoutSession(priceId, customer.id, successUrl, cancelUrl);
    return res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Error creating checkout session' });
  }
});

// Get invoice data
router.get('/invoice', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // First check if we have a subscription in our database
    const dbSubscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!dbSubscription) {
      return res.status(404).json({ error: 'No subscription found in database' });
    }

    // Get customer from Stripe
    const customers = await stripe.customers.list({
      limit: 1,
    });

    const customer = customers.data.find(c => c.metadata.userId === userId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get latest subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 1,
      status: 'active',
      expand: ['data.items.data.price']
    });

    if (!subscriptions.data.length) {
      // If no active subscription in Stripe, return database subscription info
      return res.json({
        subscriptionId: dbSubscription.stripeSubscriptionId,
        plan: dbSubscription.plan || 'Unknown',
        planName: dbSubscription.plan || 'Unknown',
        amount: 0,
        billingCycle: 'monthly',
        status: dbSubscription.status,
        startDate: dbSubscription.currentPeriodStart?.toISOString() || null,
        endDate: dbSubscription.currentPeriodEnd?.toISOString() || null,
        features: [],
      });
    }

    const subscription = subscriptions.data[0] as StripeSubscription;
    const price = subscription.items.data[0].price as Stripe.Price;
    const product = await stripe.products.retrieve(price.product as string);

    // Get plan features based on subscription plan
    const features = getPlanFeatures(dbSubscription.plan || 'Unknown');

    try {
      // Log the raw timestamps for debugging
      console.log('Raw timestamps:', {
        start: subscription.current_period_start,
        end: subscription.current_period_end
      });

      // Ensure timestamps are valid numbers
      if (!subscription.current_period_start || !subscription.current_period_end) {
        // Update database with current subscription info
        await prisma.subscription.update({
          where: { userId },
          data: {
            stripeSubscriptionId: subscription.id,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
        });

        return res.json({
          subscriptionId: subscription.id,
          plan: dbSubscription.plan,
          planName: product.name,
          amount: price.unit_amount ? price.unit_amount / 100 : 0,
          currency: price.currency,
          billingCycle: price.recurring?.interval || 'monthly',
          status: 'ACTIVE',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          features,
        });
      }

      // Convert timestamps to milliseconds before creating Date objects
      const startDate = new Date(subscription.current_period_start * 1000);
      const endDate = new Date(subscription.current_period_end * 1000);

      // Validate the dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date conversion');
      }

      // Update database with current subscription info
      await prisma.subscription.update({
        where: { userId },
        data: {
          stripeSubscriptionId: subscription.id,
          status: 'ACTIVE',
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
        },
      });

      const invoiceData = {
        subscriptionId: subscription.id,
        plan: dbSubscription.plan,
        planName: product.name,
        amount: price.unit_amount ? price.unit_amount / 100 : 0,
        currency: price.currency,
        billingCycle: price.recurring?.interval || 'monthly',
        status: 'ACTIVE',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        features,
      };

      return res.json(invoiceData);
    } catch (error) {
      console.error('Error processing subscription dates:', error);
      return res.status(500).json({ 
        error: 'Error processing subscription dates',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return res.status(500).json({ error: 'Error fetching invoice data' });
  }
});

// Create a customer portal session
router.post('/create-portal-session', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get customer ID from your database based on userId
    const customers = await stripe.customers.list({
      limit: 1,
    });

    const customer = customers.data.find(c => c.metadata.userId === userId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const session = await createPortalSession(customer.id);
    return res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return res.status(500).json({ error: 'Error creating portal session' });
  }
});

// Add webhook handler for subscription events
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const priceId = session.metadata?.priceId;

        if (!customerId || !subscriptionId || !priceId) {
          throw new Error('Missing required session data');
        }

        const customerResponse = await stripe.customers.retrieve(customerId);
        if ('deleted' in customerResponse) {
          throw new Error('Customer has been deleted');
        }
        const customer = customerResponse as Stripe.Customer;
        const userId = customer.metadata?.userId;

        if (!userId) {
          throw new Error('No userId found in customer metadata');
        }

        const plan = getPlanFromPriceId(priceId);

        await prisma.subscription.update({
          where: { userId },
          data: {
            stripeSubscriptionId: subscriptionId,
            status: 'ACTIVE',
            plan: plan,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_start: number;
          current_period_end: number;
        };
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;

        const customerResponse = await stripe.customers.retrieve(customerId);
        if ('deleted' in customerResponse) {
          throw new Error('Customer has been deleted');
        }
        const customer = customerResponse as Stripe.Customer;
        const userId = customer.metadata?.userId;

        if (!userId) {
          throw new Error('No userId found in customer metadata');
        }

        const plan = getPlanFromPriceId(priceId);

        await prisma.subscription.update({
          where: { userId },
          data: {
            status: subscription.status.toUpperCase() as any,
            plan: plan,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_start: number;
          current_period_end: number;
        };
        const customerId = subscription.customer as string;

        // Get customer to find userId
        const customerResponse = await stripe.customers.retrieve(customerId);
        if ('deleted' in customerResponse) {
          throw new Error('Customer has been deleted');
        }
        const customer = customerResponse as Stripe.Customer;
        const userId = customer.metadata?.userId;

        if (!userId) {
          throw new Error('No userId found in customer metadata');
        }

        // Update subscription status in database
        await prisma.subscription.update({
          where: {
            userId: userId,
          },
          data: {
            status: subscription.status.toUpperCase() as 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        break;
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Error processing webhook' });
  }
});

// Verify invoice
router.get('/verify-invoice/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    if (!subscriptionId) {
      return res.status(400).json({
        isValid: false,
        message: 'Invalid subscription ID',
      });
    }

    // Check if subscription exists in database
    const subscription = await prisma.subscription.findFirst({
      where: {
        stripeSubscriptionId: subscriptionId,
      },
    });

    if (!subscription) {
      return res.status(404).json({
        isValid: false,
        message: 'Invoice not found',
      });
    }

    // Verify subscription with Stripe
    try {
      // const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      return res.json({
        isValid: true,
        message: 'This is a valid invoice',
        invoiceData: {
          planName: subscription.stripePriceId ? 'Active Plan' : 'Unknown Plan', // You might want to store plan name in your database
          status: subscription.status,
          startDate: subscription.currentPeriodStart?.toISOString() || new Date().toISOString(),
          endDate: subscription.currentPeriodEnd?.toISOString() || new Date().toISOString(),
        },
      });
    } catch (stripeError) {
      return res.status(404).json({
        isValid: false,
        message: 'Invalid or expired subscription',
      });
    }
  } catch (error) {
    console.error('Error verifying invoice:', error);
    return res.status(500).json({
      isValid: false,
      message: 'Error verifying invoice',
    });
  }
});

// Helper function to get plan features
function getPlanFeatures(plan: string): string[] {
  switch (plan) {
    case 'BASIC':
      return [
        'Basic code review',
        'Up to 5 reviews per month',
        'Standard response time',
      ];
    case 'ADVANCED':
      return [
        'Advanced code review',
        'Up to 20 reviews per month',
        'Priority response time',
        'Detailed analysis',
      ];
    case 'ENTERPRISE':
      return [
        'Enterprise code review',
        'Unlimited reviews',
        '24/7 priority support',
        'Custom integration options',
        'Dedicated account manager',
      ];
    default:
      return [];
  }
}

export default router; 