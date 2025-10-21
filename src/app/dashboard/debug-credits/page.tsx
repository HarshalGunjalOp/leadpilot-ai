import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { authOrg } from "@/lib/auth-helpers";
import { getPlanConfig } from "@/config/plans";

export default async function DebugCreditsPage() {
  const { userId } = auth();

  if (!userId) {
    return <div className="p-8">Not authenticated</div>;
  }

  const { organization } = await authOrg();

  // Get subscription
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId: organization.id },
  });

  const plan = subscription?.plan || "FREE";
  const planConfig = getPlanConfig(plan);

  // Get current credit usage
  const currentMonth = new Date().toISOString().slice(0, 7);
  const creditUsage = await prisma.leadCreditUsage.findUnique({
    where: {
      organizationId_month: {
        organizationId: organization.id,
        month: currentMonth,
      },
    },
  });

  // Get actual leads
  const actualLeads = await prisma.lead.findMany({
    where: { organizationId: organization.id },
    select: {
      id: true,
      companyName: true,
      createdAt: true,
    },
  });

  const used = creditUsage?.used || 0;
  const lifetimeUsed = creditUsage?.lifetimeUsed || 0;

  // Calculate remaining leads
  let remainingLeads = 0;
  if (plan === "FREE") {
    remainingLeads = Math.max(0, planConfig.limits.leadsLifetime - lifetimeUsed);
  } else if (planConfig.limits.leadsPerMonth === -1) {
    remainingLeads = 999999;
  } else {
    remainingLeads = Math.max(0, planConfig.limits.leadsPerMonth - used);
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Credit Usage Debug Info</h1>

      <div className="space-y-6">
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Organization Info</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {organization.name}</p>
            <p><strong>ID:</strong> {organization.id}</p>
            <p><strong>Clerk ID:</strong> {organization.clerkId}</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Plan Info</h2>
          <div className="space-y-2">
            <p><strong>Plan:</strong> {plan}</p>
            <p><strong>Plan Name:</strong> {planConfig.name}</p>
            <p><strong>Monthly Limit:</strong> {planConfig.limits.leadsPerMonth === -1 ? "Unlimited" : planConfig.limits.leadsPerMonth}</p>
            <p><strong>Lifetime Limit:</strong> {planConfig.limits.leadsLifetime === -1 ? "Unlimited" : planConfig.limits.leadsLifetime}</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Credit Usage (from LeadCreditUsage table)</h2>
          {creditUsage ? (
            <div className="space-y-2">
              <p><strong>Month:</strong> {creditUsage.month}</p>
              <p><strong>Used (Monthly):</strong> {creditUsage.used}</p>
              <p><strong>Lifetime Used:</strong> {creditUsage.lifetimeUsed}</p>
              <p><strong>Remaining:</strong> {remainingLeads}</p>
            </div>
          ) : (
            <p className="text-yellow-600">No credit usage record found for current month</p>
          )}
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Actual Leads in Database</h2>
          <p className="mb-4"><strong>Total Leads:</strong> {actualLeads.length}</p>
          {actualLeads.length > 0 ? (
            <div className="space-y-2">
              {actualLeads.map((lead: any) => (
                <div key={lead.id} className="text-sm border-l-2 pl-2">
                  <p>{lead.companyName} - {new Date(lead.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No leads generated yet</p>
          )}
        </div>

        <div className={`border rounded-lg p-6 ${
          actualLeads.length === lifetimeUsed 
            ? "bg-green-50 border-green-500 dark:bg-green-950" 
            : "bg-red-50 border-red-500 dark:bg-red-950"
        }`}>
          <h2 className="text-xl font-semibold mb-4">
            {actualLeads.length === lifetimeUsed ? "✅ Status: CORRECT" : "⚠️ Status: MISMATCH"}
          </h2>
          <div className="space-y-2">
            <p><strong>Actual Leads in DB:</strong> {actualLeads.length}</p>
            <p><strong>Credit Counter Says:</strong> {lifetimeUsed}</p>
            {actualLeads.length !== lifetimeUsed && (
              <p className="text-red-600 dark:text-red-400 font-semibold mt-4">
                ⚠️ MISMATCH DETECTED! The credit counter doesn't match the actual leads.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
