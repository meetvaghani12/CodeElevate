import { Router } from 'express';
import { createCheckoutSession, createPortalSession, stripe } from '../../services/stripe';
import { authenticate } from '../../auth/middleware/auth.middleware';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const router = Router();

// Create a checkout session
router.post('/create-checkout-session', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { priceId } = req.body;
    const userId = req.user?.id;

    console.log('Received checkout session request:', { priceId, userId });

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

    const session = await createCheckoutSession(priceId, customer.id);
    return res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Error creating checkout session' });
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

export default router; 