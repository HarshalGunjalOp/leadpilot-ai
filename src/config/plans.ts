import { SubscriptionPlan } from "@prisma/client";

export const PLANS = {
  FREE: {
    name: "Free",
    plan: "FREE" as SubscriptionPlan,
    price: 0,
    limits: {
      leadsPerMonth: 0,
      leadsLifetime: 5,
    },
    features: [
      "5 total leads",
      "Basic ICP builder",
      "Lead export (CSV)",
      "Email templates",
      "Community support",
    ],
  },
  PRO_MONTHLY: {
    name: "Pro Monthly",
    plan: "PRO_MONTHLY" as SubscriptionPlan,
    price: 49,
  priceId: process.env.NEXT_PUBLIC_RZP_PLAN_PRO_MONTHLY!,
    limits: {
      leadsPerMonth: 1000,
      leadsLifetime: -1, // unlimited
    },
    features: [
      "1,000 leads per month",
      "Advanced ICP targeting",
      "AI-powered personalization",
      "Sequence builder",
      "Tech stack detection",
      "Priority support",
      "API access",
    ],
  },
  PRO_YEARLY: {
    name: "Pro Yearly",
    plan: "PRO_YEARLY" as SubscriptionPlan,
    price: 470, // 20% discount
  priceId: process.env.NEXT_PUBLIC_RZP_PLAN_PRO_YEARLY!,
    limits: {
      leadsPerMonth: 1000,
      leadsLifetime: -1,
    },
    features: [
      "1,000 leads per month",
      "Advanced ICP targeting",
      "AI-powered personalization",
      "Sequence builder",
      "Tech stack detection",
      "Priority support",
      "API access",
      "20% annual discount",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    plan: "ENTERPRISE" as SubscriptionPlan,
    price: null,
    limits: {
      leadsPerMonth: -1, // unlimited
      leadsLifetime: -1,
    },
    features: [
      "Unlimited leads",
      "Custom ICP models",
      "Dedicated AI training",
      "White-label options",
      "Advanced integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom contracts",
    ],
  },
};

export const getPlanConfig = (plan: SubscriptionPlan) => {
  switch (plan) {
    case "FREE":
      return PLANS.FREE;
    case "PRO_MONTHLY":
      return PLANS.PRO_MONTHLY;
    case "PRO_YEARLY":
      return PLANS.PRO_YEARLY;
    case "ENTERPRISE":
      return PLANS.ENTERPRISE;
    default:
      return PLANS.FREE;
  }
};

export const canGenerateLeads = (
  plan: SubscriptionPlan,
  monthlyUsed: number,
  lifetimeUsed: number
): { allowed: boolean; reason?: string } => {
  const config = getPlanConfig(plan);

  // Check lifetime limit (for FREE plan)
  if (
    config.limits.leadsLifetime !== -1 &&
    lifetimeUsed >= config.limits.leadsLifetime
  ) {
    return {
      allowed: false,
      reason: "Lifetime lead limit reached. Upgrade to generate more leads.",
    };
  }

  // Check monthly limit (for PRO plans)
  if (
    config.limits.leadsPerMonth !== -1 &&
    monthlyUsed >= config.limits.leadsPerMonth
  ) {
    return {
      allowed: false,
      reason:
        "Monthly lead limit reached. Your limit will reset at the start of your next billing period.",
    };
  }

  return { allowed: true };
};
