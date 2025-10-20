import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { SubscriptionPlan } from "@prisma/client";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class PlanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanError";
  }
}

/**
 * Get authenticated user and their active organization
 */
export async function authOrg() {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new AuthError("Unauthorized - Please sign in");
  }

  if (!orgId) {
    throw new AuthError("No organization selected");
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkId: orgId },
    include: {
      subscription: true,
    },
  });

  if (!organization) {
    // Create organization if it doesn't exist
    const newOrg = await prisma.organization.create({
      data: {
        clerkId: orgId,
        name: "My Organization",
        subscription: {
          create: {
            stripeCustomerId: `temp_${orgId}`,
            plan: "FREE",
            status: "ACTIVE",
          },
        },
      },
      include: {
        subscription: true,
      },
    });
    return { userId, orgId, organization: newOrg };
  }

  return { userId, orgId, organization };
}

/**
 * Require a specific plan or higher
 */
export async function requirePlan(
  minPlan: SubscriptionPlan
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ userId: string; orgId: string; organization: any }> {
  const { userId, orgId, organization } = await authOrg();

  const planHierarchy: Record<SubscriptionPlan, number> = {
    FREE: 0,
    PRO_MONTHLY: 1,
    PRO_YEARLY: 1,
    ENTERPRISE: 2,
  };

  const userPlanLevel = planHierarchy[organization.subscription?.plan || "FREE"];
  const requiredLevel = planHierarchy[minPlan];

  if (userPlanLevel < requiredLevel) {
    throw new PlanError(
      `This feature requires ${minPlan} plan or higher. Please upgrade.`
    );
  }

  return { userId, orgId, organization };
}

/**
 * Log an audit event for an organization
 */
export async function logAudit(params: {
  organizationId: string;
  actorId: string;
  action: string;
  entity: string;
  entityId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: any;
}) {
  await prisma.auditLog.create({
    data: params,
  });
}

/**
 * Execute a function within a Prisma transaction
 */
export async function withTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await prisma.$transaction(async (tx: any) => {
    return await callback(tx);
  });
}
