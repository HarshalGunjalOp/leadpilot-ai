import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/dashboard-nav";
import DashboardHeader from "@/components/dashboard/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
