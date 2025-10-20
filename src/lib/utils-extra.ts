export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function canGenerateLeads(
  plan: string,
  monthlyUsed: number,
  lifetimeUsed: number
): { allowed: boolean; reason?: string } {
  if (plan === "FREE") {
    if (lifetimeUsed >= 5) {
      return {
        allowed: false,
        reason: "Free plan limit reached. Upgrade to Pro for 1,000 leads/month.",
      };
    }
  } else if (plan === "PRO_MONTHLY" || plan === "PRO_YEARLY") {
    if (monthlyUsed >= 1000) {
      return {
        allowed: false,
        reason: "Monthly limit reached. Resets at billing period.",
      };
    }
  }
  return { allowed: true };
}
