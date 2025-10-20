"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Target,
  Users,
  Zap,
  Settings,
  BarChart,
} from "lucide-react";

const navigation = [
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "ICPs", href: "/dashboard/icp", icon: Target },
  { name: "Sequences", href: "/dashboard/sequences", icon: Zap },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Sparkles className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">LeadPilot AI</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-secondary")}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
