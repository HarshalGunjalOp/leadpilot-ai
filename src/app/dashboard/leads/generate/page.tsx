"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function GenerateLeadsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [icps, setIcps] = useState<any[]>([]);
  const [selectedIcp, setSelectedIcp] = useState("");
  const [leadCount, setLeadCount] = useState(5);
  const [userPlan, setUserPlan] = useState("FREE");
  const [remainingLeads, setRemainingLeads] = useState(0);
  const [loadingIcps, setLoadingIcps] = useState(true);

  useEffect(() => {
    fetchIcps();
    fetchUserPlan();
  }, []);

  const fetchIcps = async () => {
    try {
      const response = await fetch("/api/icp/list");
      if (response.ok) {
        const data = await response.json();
        setIcps(data.icps || []);
      }
    } catch (error) {
      console.error("Failed to fetch ICPs:", error);
    } finally {
      setLoadingIcps(false);
    }
  };

  const fetchUserPlan = async () => {
    try {
      const response = await fetch("/api/user/plan");
      if (response.ok) {
        const data = await response.json();
        setUserPlan(data.plan);
        setRemainingLeads(data.remainingLeads);
      }
    } catch (error) {
      console.error("Failed to fetch user plan:", error);
    }
  };

  const getMaxLeads = () => {
    if (userPlan === "FREE") {
      return Math.min(5, remainingLeads);
    }
    return 1000; // Max for paid plans
  };

  const handleLeadCountChange = (value: string) => {
    const num = parseInt(value);
    const maxLeads = getMaxLeads();
    
    if (isNaN(num) || num < 1) {
      setLeadCount(1);
    } else if (num > maxLeads) {
      setLeadCount(maxLeads);
      toast.info(`Maximum ${maxLeads} leads allowed`);
    } else {
      setLeadCount(num);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedIcp) {
      toast.error("Please select an ICP");
      return;
    }

    if (leadCount < 1) {
      toast.error("Please enter a valid number of leads");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/leads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          icpId: selectedIcp,
          count: leadCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate leads");
      }

      toast.success(`Successfully generated ${data.count} leads!`);
      
      // Emit event to update header credit count
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('leadsUpdated'));
      }
      
      setTimeout(() => {
        router.push("/dashboard/leads");
        router.refresh();
      }, 500);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate leads");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/leads">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Generate Leads</h1>
          <p className="text-muted-foreground">
            AI-powered lead generation based on your ICP
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Lead Generation
          </CardTitle>
          <CardDescription>
            Select an ICP and let AI find qualified leads for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingIcps ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : icps.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                You need to create an ICP first
              </p>
              <Link href="/dashboard/icp/new">
                <Button>Create ICP</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="icp">Select ICP</Label>
                <select
                  id="icp"
                  value={selectedIcp}
                  onChange={(e) => setSelectedIcp(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select an ICP...</option>
                  {icps.map((icp) => (
                    <option key={icp.id} value={icp.id}>
                      {icp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadCount">Number of Leads</Label>
                <Input
                  id="leadCount"
                  type="number"
                  min={1}
                  max={getMaxLeads()}
                  value={leadCount}
                  onChange={(e) => handleLeadCountChange(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  {userPlan === "FREE" 
                    ? `Free plan: Maximum ${Math.min(5, remainingLeads)} leads (${remainingLeads} remaining of 5 total lifetime)`
                    : `${userPlan} plan: Enter any number up to your monthly limit`
                  }
                </p>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="font-semibold mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• AI analyzes your ICP criteria</li>
                  <li>• Searches for matching companies</li>
                  <li>• Scores each lead (1-5)</li>
                  <li>• Generates personalized insights</li>
                  <li>• Takes ~30 seconds per batch</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading || leadCount < 1}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate {leadCount} Lead{leadCount !== 1 ? 's' : ''}
                </Button>
                <Link href="/dashboard/leads">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
