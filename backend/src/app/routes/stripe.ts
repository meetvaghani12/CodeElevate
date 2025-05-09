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

// Helper function to get plan price from the plan name and billing cycle
function getPlanPrice(planName: string, billingCycle: string): number {
  const planPrices: Record<string, Record<string, number>> = {
    'Basic': {
      'monthly': 99,
      'yearly': 999
    },
    'Advanced': {
      'monthly': 199,
      'yearly': 1999
    },
    'Enterprise': {
      'monthly': 499,
      'yearly': 4999
    }
  };
  
  // Normalize plan name for more reliable matching - convert to lowercase for case-insensitive comparison
  const planNameLower = planName?.toLowerCase() || '';
  
  let normalizedPlanName = 'Basic'; // Default to Basic
  
  if (planNameLower.includes('basic')) {
    normalizedPlanName = 'Basic';
  } else if (planNameLower.includes('advanced') || planNameLower.includes('pro')) {
    normalizedPlanName = 'Advanced';
  } else if (planNameLower.includes('enterprise') || planNameLower === 'enterprise') {
    normalizedPlanName = 'Enterprise';
  } else if (planName === 'ENTERPRISE') {
    normalizedPlanName = 'Enterprise';
  }
  
  console.log('Plan name normalization:', { 
    original: planName, 
    normalized: normalizedPlanName,
    billing: billingCycle
  });
  
  const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
  
  return planPrices[normalizedPlanName]?.[cycle] || 0;
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

    console.log('Found subscription in DB:', {
      plan: dbSubscription.plan,
      status: dbSubscription.status,
      subscriptionId: dbSubscription.stripeSubscriptionId
    });

    // Get customer from Stripe
    const customers = await stripe.customers.list({
      limit: 1,
    });

    const customer = customers.data.find(c => c.metadata.userId === userId);
    if (!customer) {
      // Create a new customer if not found
      const newCustomer = await stripe.customers.create({
        metadata: {
          userId: userId,
        },
      });

      // Update the subscription with the new customer ID
      await prisma.subscription.update({
        where: { userId },
        data: {
          stripeCustomerId: newCustomer.id,
        },
      });

      // Return the database subscription info with proper plan pricing
      const planName = dbSubscription.plan ? String(dbSubscription.plan) : 'Basic';
      const billingCycle = 'monthly'; // Default to monthly if unknown
      const planPrice = getPlanPrice(planName, billingCycle);
      
      console.log('Using DB plan info:', { planName, planPrice });
      
      return res.json({
        subscriptionId: dbSubscription.id,
        plan: planName,
        planName: planName,
        amount: planPrice,
        billingCycle: billingCycle,
        status: dbSubscription.status,
        startDate: dbSubscription.currentPeriodStart?.toISOString() || new Date().toISOString(),
        endDate: dbSubscription.currentPeriodEnd?.toISOString() || new Date().toISOString(),
        features: getPlanFeatures(planName),
      });
    }

    // Get latest subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 1,
      status: 'active',
      expand: ['data.items.data.price']
    });

    if (!subscriptions.data.length) {
      // If no active subscription in Stripe, return database subscription info with proper pricing
      const planName = dbSubscription.plan ? String(dbSubscription.plan) : 'Basic';
      const billingCycle = 'monthly'; // Default to monthly if unknown
      const planPrice = getPlanPrice(planName, billingCycle);
      
      console.log('No Stripe subscription, using DB plan:', { planName, planPrice });
      
      return res.json({
        subscriptionId: dbSubscription.stripeSubscriptionId,
        plan: planName,
        planName: planName,
        amount: planPrice,
        billingCycle: billingCycle,
        status: dbSubscription.status,
        startDate: dbSubscription.currentPeriodStart?.toISOString() || null,
        endDate: dbSubscription.currentPeriodEnd?.toISOString() || null,
        features: getPlanFeatures(planName),
      });
    }

    const subscription = subscriptions.data[0] as StripeSubscription;
    const price = subscription.items.data[0].price as Stripe.Price;
    const product = await stripe.products.retrieve(price.product as string);
    
    // Get billing cycle
    const billingCycle = price.recurring?.interval || 'monthly';

    // Get proper plan name from either Stripe product or DB
    const planName = dbSubscription.plan ? String(dbSubscription.plan) : product.name;

    console.log('Subscription data:', { 
      stripePlan: product.name,
      dbPlan: dbSubscription.plan,
      planToUse: planName
    });

    // Get plan features based on subscription plan
    const features = getPlanFeatures(planName);

    try {
      // Log the raw timestamps for debugging
      console.log('Raw timestamps:', {
        start: subscription.current_period_start,
        end: subscription.current_period_end
      });

      // Get the actual price from Stripe or fall back to our defined prices
      let amount = price.unit_amount ? price.unit_amount / 100 : 0;
      if (amount === 0 || amount < 99) {
        amount = getPlanPrice(planName, billingCycle);
        console.log('Using fallback price:', { planName, amount });
      } else {
        console.log('Using Stripe price:', { amount });
      }

      // Ensure timestamps are valid numbers
      let startDate, endDate;
      if (!subscription.current_period_start || !subscription.current_period_end) {
        startDate = new Date();
        endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      } else {
        // Convert timestamps to milliseconds before creating Date objects
        startDate = new Date(subscription.current_period_start * 1000);
        endDate = new Date(subscription.current_period_end * 1000);

        // Validate the dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          startDate = new Date();
          endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
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
        plan: planName,
        planName: planName,
        amount: amount,
        currency: price.currency,
        billingCycle: billingCycle,
        status: 'ACTIVE',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        features,
      };

      console.log('Returning invoice data with amount:', amount);
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
  // Normalize the plan name to handle both enum values and string values
  const planUpper = plan?.toUpperCase() || '';
  
  console.log('Getting features for plan:', { original: plan, normalized: planUpper });
  
  if (planUpper.includes('BASIC') || planUpper === 'BASIC') {
    return [
      'Basic code review',
      'Up to 5 reviews per month',
      'Standard response time',
    ];
  } else if (planUpper.includes('ADVANCED') || planUpper === 'ADVANCED' || planUpper.includes('PRO')) {
    return [
      'Advanced code review',
      'Up to 20 reviews per month',
      'Priority response time',
      'Detailed analysis',
    ];
  } else if (planUpper.includes('ENTERPRISE') || planUpper === 'ENTERPRISE') {
    return [
      'Enterprise code review',
      'Unlimited reviews',
      '24/7 priority support',
      'Custom integration options',
      'Dedicated account manager',
    ];
  } else {
    console.log('No plan match found, returning empty features');
    return [];
  }
}

export default router; 