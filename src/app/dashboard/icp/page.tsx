import { authOrg } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Target, Edit, Trash2 } from "lucide-react";

// Disable caching to always show fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ICPPage() {
  const { organization } = await authOrg();

  const icps = await prisma.iCP.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { leads: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ideal Customer Profiles</h1>
          <p className="text-muted-foreground">
            Define and manage your target customer profiles
          </p>
        </div>
        <Link href="/dashboard/icp/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create ICP
          </Button>
        </Link>
      </div>

      {icps.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No ICPs yet</CardTitle>
            <CardDescription>
              Create your first Ideal Customer Profile to start generating leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/icp/new">
              <Button>
                <Target className="mr-2 h-4 w-4" />
                Create Your First ICP
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {icps.map((icp: any) => (
            <Card key={icp.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {icp.name}
                      {icp.isActive && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {icp.description || "No description"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Leads generated</span>
                    <span className="font-semibold">{icp._count.leads}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/dashboard/icp/${icp.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
