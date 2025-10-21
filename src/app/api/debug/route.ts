import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { authOrg } from "@/lib/auth-helpers";

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

    // Test database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Get all ICPs
    const icps = await prisma.iCP.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" },
    });

    // Get all leads
    const leads = await prisma.lead.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" },
    });

    // Get credit usage
    const creditUsage = await prisma.leadCreditUsage.findMany({
      where: { organizationId: organization.id },
    });

    return NextResponse.json({
      success: true,
      database: "connected",
      user: { userId, orgId: organization.id, orgName: organization.name },
      data: {
        icps: {
          count: icps.length,
          items: icps,
        },
        leads: {
          count: leads.length,
          items: leads,
        },
        creditUsage,
      },
    });
  } catch (error: any) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
