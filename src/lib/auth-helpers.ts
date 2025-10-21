import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Define the subscription plan type locally
type SubscriptionPlan = "FREE" | "PRO_MONTHLY" | "PRO_YEARLY" | "ENTERPRISE";

// Prisma transaction client type
type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

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
 * For personal accounts (no orgId), we use userId as the organization identifier
 */
export async function authOrg() {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new AuthError("Unauthorized - Please sign in");
  }

  // Use orgId if available (team/org account), otherwise use userId (personal account)
  const effectiveOrgId = orgId || userId;

  let organization = await prisma.organization.findUnique({
    where: { clerkId: effectiveOrgId },
    include: {
      subscription: true,
    },
  });

  if (!organization) {
    // Create organization if it doesn't exist (for both personal and org accounts)
    organization = await prisma.organization.create({
      data: {
        clerkId: effectiveOrgId,
        name: orgId ? "My Organization" : "Personal Account",
        subscription: {
          create: {
            stripeCustomerId: `temp_${effectiveOrgId}`,
            plan: "FREE",
            status: "ACTIVE",
          },
        },
      },
      include: {
        subscription: true,
      },
    });
  }

  return { userId, orgId: effectiveOrgId, organization };
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

  const currentPlan = (organization.subscription?.plan || "FREE") as SubscriptionPlan;
  const userPlanLevel = planHierarchy[currentPlan];
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
  callback: (tx: PrismaTransactionClient) => Promise<T>
): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await prisma.$transaction(async (tx: any) => {
    return await callback(tx);
  });
}
