import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const plans = [
  {
    name: 'Basic',
    price: {
      monthly: 9,
      yearly: 90,
    },
    features: [
      '5 code reviews per month',
      'Basic code analysis',
      'Email support',
    ],
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID,
    },
  },
  {
    name: 'Pro',
    price: {
      monthly: 29,
      yearly: 290,
    },
    features: [
      '20 code reviews per month',
      'Advanced code analysis',
      'Priority support',
      'Team collaboration',
    ],
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    },
  },
  {
    name: 'Enterprise',
    price: {
      monthly: 99,
      yearly: 990,
    },
    features: [
      'Unlimited code reviews',
      'Enterprise-grade analysis',
      '24/7 support',
      'Custom integrations',
      'Dedicated account manager',
    ],
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    },
  },
];

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { user } = useAuth();

  const handleSubscribe = async (priceId: string) => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <div className="flex justify-center gap-4">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly (Save 20%)
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="border rounded-lg p-6 flex flex-col"
          >
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold mb-4">
              ${plan.price[billingCycle]}
              <span className="text-sm font-normal text-gray-500">
                /{billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            <ul className="space-y-2 mb-6 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              onClick={() => handleSubscribe(plan.priceId[billingCycle]!)}
            >
              {user ? 'Subscribe' : 'Sign up to subscribe'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 