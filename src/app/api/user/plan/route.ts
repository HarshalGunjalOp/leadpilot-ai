import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { authOrg } from "@/lib/auth-helpers";
import { getPlanConfig } from "@/config/plans";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { organization } = await authOrg();

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: organization.id },
    });

    const plan = subscription?.plan || "FREE";
    const planConfig = getPlanConfig(plan);

    // Get current credit usage
    const currentMonth = new Date().toISOString().slice(0, 7);
    const creditUsage = await prisma.leadCreditUsage.findUnique({
      where: {
        organizationId_month: {
          organizationId: organization.id,
          month: currentMonth,
        },
      },
    });

    const used = creditUsage?.used || 0;
    const lifetimeUsed = creditUsage?.lifetimeUsed || 0;

    // Calculate remaining leads
    let remainingLeads = 0;
    if (plan === "FREE") {
      // Free plan has lifetime limit
      remainingLeads = Math.max(0, planConfig.limits.leadsLifetime - lifetimeUsed);
    } else if (planConfig.limits.leadsPerMonth === -1) {
      // Unlimited
      remainingLeads = 999999;
    } else {
      // Monthly limit
      remainingLeads = Math.max(0, planConfig.limits.leadsPerMonth - used);
    }

    return NextResponse.json({
      plan,
      planName: planConfig.name,
      limits: planConfig.limits,
      usage: {
        monthly: used,
        lifetime: lifetimeUsed,
      },
      remainingLeads,
    });
  } catch (error: any) {
    console.error("Failed to get user plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get plan info" },
      { status: 500 }
    );
  }
}
