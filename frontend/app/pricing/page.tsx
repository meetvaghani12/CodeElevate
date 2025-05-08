"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { loadStripe } from "@stripe/stripe-js"
import { ArrowRight, CheckCircle,ArrowLeft } from "lucide-react"
import Link from "next/link"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);


const plans = [
  {
    name: "Basic",
    description: "Perfect for individual developers",
    price: {
      monthly: 99,
      yearly: 999,
    },
    features: [
      "Up to 5 Projects",
      "Up to 30 File Reviews",
      "Basic LLM Model",
    ],
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID,
    },
  },
  {
    name: "Advanced",
    description: "Ideal for growing teams",
    price: {
      monthly: 199,
      yearly: 1999,
    },
    features: [
      "Up to 25 Projects Per Month",
      "200 File Reviews Per Month",
      "Advanced LLM Models",
      "Security vulnerability scanning",
      "Code quality metrics",
    ],
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    },
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: {
      monthly: 499,
      yearly: 4999,
    },
    features: [
      "Unlimited Projects",
      "Unlimited File Reviews",
      "AI Agent & Advanced LLM",
      "Custom integrations",
      "Advanced security features",
      "Custom reporting",
    ],
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    },
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const { user } = useAuth();

  const handleSubscribe = async (priceId: string) => {
    try {
      if (!user) {
        // Redirect to sign up if not logged in
        window.location.href = '/signup';
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');

      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/signin';
        return;
      }

      console.log('Subscribing with price ID:', priceId);

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          token,
        }),
      });

      const data = await response.json();
      console.log('Checkout session response:', data);

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No URL in response:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10 md:py-18">
      <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your needs. All plans include our core features
            with different levels of access and support.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('monthly')}
            className="min-w-[120px]"
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('yearly')}
            className="min-w-[120px]"
          >
            Yearly (Save 15%)
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="border rounded-lg p-8 flex flex-col relative"
            >
              {plan.name === "Advanced" && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Best Choice
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold">
                ₹{plan.price[billingCycle]}
                  <span className="text-base font-normal text-muted-foreground">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  const priceId = plan.priceId[billingCycle];
                  console.log(`Subscribing to ${plan.name} ₹{billingCycle} plan:`, priceId);
                  handleSubscribe(priceId!);
                }}
              >
                {user ? (
                  <>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Sign up to subscribe'
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a custom plan?</h2>
          <p className="text-muted-foreground mb-6">
            Contact us for custom pricing and features tailored to your needs.
          </p>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 