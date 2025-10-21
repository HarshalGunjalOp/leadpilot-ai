import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Define valid subscription plans
type SubscriptionPlanType = "PRO_MONTHLY" | "PRO_YEARLY";

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await currentUser();
    const { planId, planType } = await req.json();

    if (!planId || !planType) {
      return NextResponse.json(
        { error: "Missing plan details" },
        { status: 400 }
      );
    }

    // Validate plan type
    const validPlans: SubscriptionPlanType[] = ["PRO_MONTHLY", "PRO_YEARLY"];
    if (!validPlans.includes(planType as SubscriptionPlanType)) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      );
    }

    // Get or create organization
    let organization = await prisma.organization.findUnique({
      where: { clerkId: orgId || userId },
      include: { subscription: true },
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          clerkId: orgId || userId,
          name: user?.firstName
            ? `${user.firstName}'s Organization`
            : "My Organization",
          subscription: {
            create: {
              stripeCustomerId: `temp_${orgId || userId}`,
              plan: "FREE",
              status: "ACTIVE",
            },
          },
        },
        include: { subscription: true },
      });
    }

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: planType === "PRO_YEARLY" ? 12 : 1, // 12 months for yearly, 1 for monthly recurring
      notes: {
        userId: userId,
        orgId: orgId || userId,
        planType: planType,
      },
    });

    // Store subscription details temporarily
    await prisma.subscription.update({
      where: { id: organization.subscription!.id },
      data: {
        razorpaySubscriptionId: subscription.id,
        plan: planType,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      email: user?.emailAddresses[0]?.emailAddress || "",
    });
  } catch (error: any) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}
