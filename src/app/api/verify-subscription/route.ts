import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = await req.json();

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Update subscription status
    const organization = await prisma.organization.findUnique({
      where: { clerkId: orgId || userId },
      include: { subscription: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    await prisma.subscription.update({
      where: { id: organization.subscription!.id },
      data: {
        status: "ACTIVE",
        razorpayPaymentId: razorpay_payment_id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days from now
        ),
      },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        organizationId: organization.id,
        actorId: userId,
        action: "SUBSCRIPTION_ACTIVATED",
        entity: "subscription",
        entityId: organization.subscription!.id,
        meta: {
          plan: organization.subscription!.plan,
          paymentId: razorpay_payment_id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify subscription" },
      { status: 500 }
    );
  }
}
