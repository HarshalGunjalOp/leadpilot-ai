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

    const icps = await prisma.iCP.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
      },
    });

    return NextResponse.json({ icps });
  } catch (error: any) {
    console.error("ICP list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch ICPs" },
      { status: 500 }
    );
  }
}
