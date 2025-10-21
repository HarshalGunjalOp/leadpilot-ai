import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { authOrg } from "@/lib/auth-helpers";

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
    const body = await req.json();
    const { name, description, filters } = body;

    console.log("Creating ICP:", { userId, orgId: organization.id, name, description, filters });

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const icp = await prisma.iCP.create({
      data: {
        organizationId: organization.id,
        name,
        description: description || null,
        filters: filters || {},
        createdBy: userId,
        isActive: true,
      },
    });

    console.log("ICP created successfully:", icp.id);

    return NextResponse.json({ success: true, icp });
  } catch (error: any) {
    console.error("ICP creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create ICP" },
      { status: 500 }
    );
  }
}
