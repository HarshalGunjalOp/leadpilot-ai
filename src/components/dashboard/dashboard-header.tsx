"use client";

import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardHeader() {
  const [creditInfo, setCreditInfo] = useState<{
    used: number;
    limit: number;
    plan: string;
  } | null>(null);

  useEffect(() => {
    // Fetch credit usage
    const fetchCreditInfo = () => {
      fetch("/api/user/plan")
        .then((res) => res.json())
        .then((data) => {
          const limit = data.plan === "FREE" 
            ? data.limits.leadsLifetime 
            : data.limits.leadsPerMonth;
          
          const used = data.plan === "FREE"
            ? data.usage.lifetime
            : data.usage.monthly;

          setCreditInfo({
            used,
            limit: limit === -1 ? 999999 : limit,
            plan: data.plan,
          });
        })
        .catch((error) => {
          console.error("Failed to fetch credit info:", error);
        });
    };

    // Initial fetch
    fetchCreditInfo();

    // Refresh every 10 seconds to catch updates
    const interval = setInterval(fetchCreditInfo, 10000);

    // Listen for custom event when leads are generated
    const handleLeadsUpdate = () => fetchCreditInfo();
    window.addEventListener("leadsUpdated", handleLeadsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("leadsUpdated", handleLeadsUpdate);
    };
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b px-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm">
          <Search className="mr-2 h-4 w-4" />
          Search... <kbd className="ml-2 text-xs">⌘K</kbd>
        </Button>
      </div>
      <div className="flex items-center gap-4">
        {creditInfo ? (
          <Badge variant={creditInfo.used >= creditInfo.limit ? "destructive" : "secondary"}>
            <span className="text-xs">
              {creditInfo.limit === 999999 
                ? `${creditInfo.used} leads used`
                : `${creditInfo.used} / ${creditInfo.limit} leads used`
              }
            </span>
          </Badge>
        ) : (
          <Badge variant="secondary">
            <span className="text-xs">Loading...</span>
          </Badge>
        )}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
