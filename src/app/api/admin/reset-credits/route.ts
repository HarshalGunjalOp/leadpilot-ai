import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { authOrg } from "@/lib/auth-helpers";

// ADMIN ENDPOINT - Reset credit usage for current organization
// This should be protected in production or removed
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { organization } = await authOrg();

    // Get actual lead count
    const actualLeadCount = await prisma.lead.count({
      where: { organizationId: organization.id },
    });

    // Get current month
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Update or create credit usage to match actual leads
    const creditUsage = await prisma.leadCreditUsage.upsert({
      where: {
        organizationId_month: {
          organizationId: organization.id,
          month: currentMonth,
        },
      },
      update: {
        used: actualLeadCount,
        lifetimeUsed: actualLeadCount,
      },
      create: {
        organizationId: organization.id,
        month: currentMonth,
        used: actualLeadCount,
        lifetimeUsed: actualLeadCount,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Credit usage synchronized with actual lead count",
      data: {
        actualLeads: actualLeadCount,
        creditUsage: {
          monthly: creditUsage.used,
          lifetime: creditUsage.lifetimeUsed,
        },
      },
    });
  } catch (error: any) {
    console.error("Failed to reset credits:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset credits" },
      { status: 500 }
    );
  }
}
