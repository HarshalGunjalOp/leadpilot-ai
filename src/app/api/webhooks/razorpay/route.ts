import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySignature } from "@/lib/razorpay";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("x-razorpay-signature") || "";

  if (!signature) {
    return new NextResponse("No signature", { status: 400 });
  }

  // Verify signature
  const verified = verifySignature(body, signature, webhookSecret);
  if (!verified) {
    console.error("Razorpay webhook verification failed");
    return new NextResponse("Webhook Error", { status: 400 });
  }

  const payload = JSON.parse(body);

  try {
    const event = payload.event;

    switch (event) {
      case "subscription.charged":
      case "subscription.activated":
      case "subscription.updated":
        await handleSubscriptionChange(payload.payload.subscription.entity);
        break;
      case "subscription.cancelled":
        await handleSubscriptionDeleted(payload.payload.subscription.entity);
        break;
      case "payment.captured":
        await handlePaymentSucceeded(payload.payload.payment.entity);
        break;
      case "payment.failed":
        await handlePaymentFailed(payload.payload.payment.entity);
        break;
      default:
        console.log(`Unhandled Razorpay event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook handler error:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionChange(subscription: any) {
  const customerId = subscription.customer_id as string;
  const planId = subscription.plan_id as string;

  let plan: SubscriptionPlan = "FREE";
  if (planId === process.env.NEXT_PUBLIC_RZP_PLAN_PRO_MONTHLY) {
    plan = "PRO_MONTHLY";
  } else if (planId === process.env.NEXT_PUBLIC_RZP_PLAN_PRO_YEARLY) {
    plan = "PRO_YEARLY";
  }

  const status: SubscriptionStatus = subscription.status?.toUpperCase() || "ACTIVE" as SubscriptionStatus;

  await prisma.subscription.upsert({
    where: { stripeCustomerId: customerId },
    update: {
      stripeSubId: subscription.id,
      plan,
      status,
      currentPeriodEnd: subscription.current_end ? new Date(subscription.current_end * 1000) : null,
      cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
    },
    create: {
      stripeCustomerId: customerId,
      stripeSubId: subscription.id,
      plan,
      status,
      currentPeriodEnd: subscription.current_end ? new Date(subscription.current_end * 1000) : null,
      cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
      organization: {
        connect: {
          clerkId: subscription.notes?.orgId || "",
        },
      },
    },
  });

  // Reset monthly usage on renewal
  if (status === "ACTIVE") {
    const org = await prisma.organization.findFirst({
      where: { subscription: { stripeCustomerId: customerId } },
    });

    if (org) {
      const currentMonth = new Date().toISOString().substring(0, 7);
      await prisma.leadCreditUsage.upsert({
        where: {
          organizationId_month: {
            organizationId: org.id,
            month: currentMonth,
          },
        },
        update: { used: 0 },
        create: {
          organizationId: org.id,
          month: currentMonth,
          used: 0,
          lifetimeUsed: 0,
        },
      });
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionDeleted(subscription: any) {
  const customerId = subscription.customer_id as string;

  await prisma.subscription.updateMany({
    where: { stripeCustomerId: customerId },
    data: { status: "CANCELED", plan: "FREE" },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentSucceeded(payment: any) {
  const customerId = payment.customer_id || payment.subscriptions?.customer_id || "";
  if (!customerId) return;

  await prisma.subscription.updateMany({
    where: { stripeCustomerId: customerId },
    data: { status: "ACTIVE" },
  });

  console.log("Razorpay payment succeeded for customer:", customerId);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentFailed(payment: any) {
  const customerId = payment.customer_id || payment.subscriptions?.customer_id || "";
  if (!customerId) return;

  await prisma.subscription.updateMany({
    where: { stripeCustomerId: customerId },
    data: { status: "PAST_DUE" },
  });

  console.log("Razorpay payment failed for customer:", customerId);
}