import prisma from "@/lib/prisma";
import { authOrg } from "@/lib/auth-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";

// Disable caching to always show fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LeadsPage() {
  const { organization } = await authOrg();

  const leads = await prisma.lead.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Fetch ICPs for future filtering feature
  // const icps = await prisma.iCP.findMany({
  //   where: { organizationId: organization.id },
  //   select: { id: true, name: true },
  // });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
            Manage and export your generated leads
          </p>
        </div>
        <Link href="/dashboard/leads/generate">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Generate Leads
          </Button>
        </Link>
      </div>

      {leads.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No leads yet</CardTitle>
            <CardDescription>
              Create an ICP and generate your first leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/icp/new">
              <Button>Create ICP</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Leads ({leads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads.map((lead: any) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{lead.companyName}</h3>
                      <Badge variant={lead.aiScore >= 4 ? "default" : "secondary"}>
                        Score: {lead.aiScore}/5
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lead.domain} • {lead.industry}
                    </p>
                    {lead.personalization && (
                      <p className="text-sm italic">{lead.personalization}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
