"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, ArrowLeft, Zap } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "",
    description: "Perfect for trying out LeadPilot",
    features: [
      "5 total leads",
      "Basic ICP builder",
      "CSV export",
      "Email templates",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "pro-monthly",
    name: "Pro",
    price: 49,
    period: "/month",
    description: "For growing sales teams",
    features: [
      "1,000 leads/month",
      "AI personalization",
      "Sequence builder",
      "Tech stack detection",
      "Priority support",
      "API access",
    ],
    cta: "Start Trial",
    popular: true,
    planId: process.env.NEXT_PUBLIC_RZP_PLAN_PRO_MONTHLY,
  },
  {
    id: "pro-yearly",
    name: "Pro Yearly",
    price: 470,
    period: "/year",
    description: "Save 20% with annual billing",
    features: [
      "1,000 leads/month",
      "AI personalization",
      "Sequence builder",
      "Tech stack detection",
      "Priority support",
      "API access",
      "20% annual discount",
    ],
    cta: "Start Trial",
    popular: false,
    planId: process.env.NEXT_PUBLIC_RZP_PLAN_PRO_YEARLY,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    period: "",
    description: "Custom solutions at scale",
    features: [
      "Unlimited leads",
      "Custom AI models",
      "White-label options",
      "Dedicated support",
      "SLA guarantee",
      "Custom contracts",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePlanSelection = async (plan: typeof PLANS[0]) => {
    // Free plan - just sign up
    if (plan.id === "free") {
      if (isSignedIn) {
        router.push("/dashboard");
      } else {
        router.push("/sign-up");
      }
      return;
    }

    // Enterprise - contact sales
    if (plan.id === "enterprise") {
      window.location.href = "mailto:sales@leadpilot.ai?subject=Enterprise Plan Inquiry";
      return;
    }

    // Pro plans - require authentication
    if (!isSignedIn) {
      router.push("/sign-up");
      return;
    }

    // Handle Razorpay subscription
    if (!plan.planId) {
      toast.error("Plan configuration error. Please contact support.");
      return;
    }

    setLoading(plan.id);

    try {
      // Create subscription
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.planId,
          planType: plan.id === "pro-monthly" ? "PRO_MONTHLY" : "PRO_YEARLY",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          subscription_id: data.subscriptionId,
          name: "LeadPilot AI",
          description: `${plan.name} Subscription`,
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyResponse = await fetch("/api/verify-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_subscription_id: response.razorpay_subscription_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (verifyResponse.ok) {
                toast.success("Subscription activated successfully!");
                router.push("/dashboard");
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (error) {
              console.error("Verification error:", error);
              toast.error("Payment verification failed. Please contact support.");
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(null);
              toast.error("Payment cancelled");
            },
          },
          prefill: {
            email: data.email || "",
          },
          theme: {
            color: "#000000",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        setLoading(null);
      };

      script.onerror = () => {
        setLoading(null);
        toast.error("Failed to load payment gateway. Please try again.");
      };
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(error.message || "Failed to start subscription");
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">LeadPilot AI</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Pricing Section */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4">
                <Zap className="mr-1 h-3 w-3" />
                Pricing
              </Badge>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Choose your plan
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Start free, upgrade when you're ready to scale
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col ${
                    plan.popular ? "border-primary shadow-lg" : ""
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute right-4 top-4">Popular</Badge>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      {plan.price !== null ? (
                        <>
                          <span className="text-4xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground">{plan.period}</span>
                        </>
                      ) : (
                        <span className="text-4xl font-bold">Custom</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handlePlanSelection(plan)}
                      disabled={loading === plan.id}
                    >
                      {loading === plan.id ? "Loading..." : plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* FAQ or Additional Info */}
            <div className="mx-auto mt-16 max-w-3xl text-center">
              <p className="text-sm text-muted-foreground">
                All plans include our core features. Upgrade or downgrade at any time.
                Questions? Contact us at{" "}
                <a
                  href="mailto:support@leadpilot.ai"
                  className="font-medium text-primary hover:underline"
                >
                  support@leadpilot.ai
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
