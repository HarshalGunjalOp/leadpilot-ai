import { authOrg } from "@/lib/auth-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, CreditCard, Users, Bell } from "lucide-react";
import Link from "next/link";
import { getPlanConfig } from "@/config/plans";

export default async function SettingsPage() {
  const { organization } = await authOrg();
  const subscription = organization.subscription;
  const planConfig = getPlanConfig(subscription?.plan || "FREE");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and subscription
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>
              Manage your plan and billing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Plan</span>
              <Badge variant="default">{planConfig.name}</Badge>
            </div>
            
            {planConfig.price !== null && planConfig.price > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="font-semibold">${planConfig.price}/mo</span>
              </div>
            ) : null}

            <div className="pt-4">
              <Link href="/pricing">
                <Button className="w-full">
                  {subscription?.plan === "FREE" ? "Upgrade Plan" : "Manage Subscription"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Organization Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Organization
            </CardTitle>
            <CardDescription>
              Organization settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Name</span>
              <p className="font-medium">{organization.name}</p>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="secondary">{subscription?.status || "ACTIVE"}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email notifications</span>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Notification settings coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* API Access Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              API Access
            </CardTitle>
            <CardDescription>
              Manage API keys and integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                API access is available for Pro and Enterprise plans
              </p>
              {subscription?.plan === "FREE" ? (
                <Link href="/pricing">
                  <Button variant="outline" size="sm" className="w-full">
                    Upgrade to Access API
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" className="w-full">
                  Generate API Key
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
