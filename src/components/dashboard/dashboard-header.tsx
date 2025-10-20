"use client";

import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Search } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm">
          <Search className="mr-2 h-4 w-4" />
          Search... <kbd className="ml-2 text-xs">⌘K</kbd>
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant="secondary">
          <span className="text-xs">5 / 5 leads used</span>
        </Badge>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
