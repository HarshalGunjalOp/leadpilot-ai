import { authOrg } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Zap, Mail, Linkedin } from "lucide-react";

export default async function SequencesPage() {
  const { organization } = await authOrg();

  const sequences = await prisma.sequence.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sequences</h1>
          <p className="text-muted-foreground">
            Build multi-touch outreach campaigns
          </p>
        </div>
        <Link href="/dashboard/sequences/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Sequence
          </Button>
        </Link>
      </div>

      {sequences.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No sequences yet</CardTitle>
            <CardDescription>
              Create your first outreach sequence to engage with leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/sequences/new">
              <Button>
                <Zap className="mr-2 h-4 w-4" />
                Create Your First Sequence
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sequences.map((sequence: any) => {
            const steps = sequence.steps as any;
            const stepCount = Array.isArray(steps) ? steps.length : 0;
            
            return (
              <Card key={sequence.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {sequence.name}
                        {sequence.isActive && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {sequence.description || "No description"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/sequences/${sequence.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      {stepCount} steps
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
