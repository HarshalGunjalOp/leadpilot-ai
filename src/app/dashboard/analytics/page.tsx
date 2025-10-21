import { authOrg } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, TrendingUp, Users, Target, Sparkles } from "lucide-react";

export default async function AnalyticsPage() {
  const { organization } = await authOrg();

  // Get analytics data
  const [totalLeads, totalIcps, creditUsage] = await Promise.all([
    prisma.lead.count({ where: { organizationId: organization.id } }),
    prisma.iCP.count({ where: { organizationId: organization.id } }),
    prisma.leadCreditUsage.findFirst({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyUsed = creditUsage?.month === currentMonth ? creditUsage.used : 0;
  const lifetimeUsed = creditUsage?.lifetimeUsed || 0;

  const stats = [
    {
      title: "Total Leads",
      value: totalLeads,
      icon: Users,
      description: "All time",
    },
    {
      title: "Active ICPs",
      value: totalIcps,
      icon: Target,
      description: "Target profiles",
    },
    {
      title: "This Month",
      value: monthlyUsed,
      icon: TrendingUp,
      description: "Leads generated",
    },
    {
      title: "Lifetime",
      value: lifetimeUsed,
      icon: Sparkles,
      description: "Total generated",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your lead generation performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Performance Overview
          </CardTitle>
          <CardDescription>
            Detailed analytics coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <BarChart className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Advanced analytics and reports will be available here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
