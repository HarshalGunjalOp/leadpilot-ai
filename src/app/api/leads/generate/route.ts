import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { authOrg } from "@/lib/auth-helpers";
import { canGenerateLeads } from "@/config/plans";

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
    const { icpId, count = 5 } = await req.json();

    if (!icpId) {
      return NextResponse.json(
        { error: "ICP ID is required" },
        { status: 400 }
      );
    }

    // Validate count
    const requestedCount = Math.max(1, Math.min(count, 1000));

    // Check if ICP exists and belongs to organization
    const icp = await prisma.iCP.findFirst({
      where: {
        id: icpId,
        organizationId: organization.id,
      },
    });

    if (!icp) {
      return NextResponse.json(
        { error: "ICP not found" },
        { status: 404 }
      );
    }

    // Get current usage
    const currentMonth = new Date().toISOString().slice(0, 7);
    let creditUsage = await prisma.leadCreditUsage.findUnique({
      where: {
        organizationId_month: {
          organizationId: organization.id,
          month: currentMonth,
        },
      },
    });

    if (!creditUsage) {
      creditUsage = await prisma.leadCreditUsage.create({
        data: {
          organizationId: organization.id,
          month: currentMonth,
          used: 0,
          lifetimeUsed: 0,
        },
      });
    }

    // Check if user can generate the requested number of leads
    const plan = organization.subscription?.plan || "FREE";
    const canGenerate = canGenerateLeads(
      plan,
      creditUsage.used,
      creditUsage.lifetimeUsed
    );

    if (!canGenerate.allowed) {
      return NextResponse.json(
        { error: canGenerate.reason },
        { status: 403 }
      );
    }

    // Calculate how many leads can actually be generated
    const planConfig = canGenerateLeads(plan, 0, 0);
    let actualCount = requestedCount;

    if (plan === "FREE") {
      const remainingLifetime = 5 - creditUsage.lifetimeUsed;
      actualCount = Math.min(requestedCount, remainingLifetime);
      
      if (actualCount <= 0) {
        return NextResponse.json(
          { error: "You've used all 5 free leads. Upgrade to generate more." },
          { status: 403 }
        );
      }
    }

    console.log("Generating leads:", { plan, requestedCount, actualCount, lifetimeUsed: creditUsage.lifetimeUsed });

    // Generate mock leads (in production, this would call your AI service)
    const mockLeads = Array.from({ length: actualCount }, (_, i) => ({
      organizationId: organization.id,
      icpId: icp.id,
      companyName: `Company ${i + 1}`,
      domain: `company${i + 1}.com`,
      website: `https://company${i + 1}.com`,
      industry: "Technology",
      companySize: "11-50",
      aiScore: Math.floor(Math.random() * 3) + 3, // 3-5
      status: "new",
      personalization: `This company matches your ICP criteria for ${icp.name}`,
    }));

    // Insert leads
    await prisma.lead.createMany({
      data: mockLeads,
    });

    // Update credit usage
    await prisma.leadCreditUsage.update({
      where: {
        organizationId_month: {
          organizationId: organization.id,
          month: currentMonth,
        },
      },
      data: {
        used: creditUsage.used + mockLeads.length,
        lifetimeUsed: creditUsage.lifetimeUsed + mockLeads.length,
      },
    });

    console.log("Leads generated successfully:", { count: mockLeads.length, newLifetimeTotal: creditUsage.lifetimeUsed + mockLeads.length });

    return NextResponse.json({
      success: true,
      count: mockLeads.length,
      message: `Successfully generated ${mockLeads.length} leads`,
    });
  } catch (error: any) {
    console.error("Lead generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate leads" },
      { status: 500 }
    );
  }
}
