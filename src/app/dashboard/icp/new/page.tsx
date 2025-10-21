"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewICPPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industries: "",
    companySize: "",
    roles: "",
    geography: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting ICP form:", formData);

      const response = await fetch("/api/icp/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          filters: {
            industries: formData.industries.split(",").map((s) => s.trim()).filter(Boolean),
            companySize: formData.companySize.split(",").map((s) => s.trim()).filter(Boolean),
            roles: formData.roles.split(",").map((s) => s.trim()).filter(Boolean),
            geography: formData.geography.split(",").map((s) => s.trim()).filter(Boolean),
          },
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create ICP");
      }

      toast.success("ICP created successfully!");
      
      // Add a small delay before redirect to ensure user sees the success message
      setTimeout(() => {
        router.push("/dashboard/icp");
        router.refresh(); // Force refresh the page data
      }, 500);
    } catch (error: any) {
      console.error("ICP creation error:", error);
      toast.error(error.message || "Failed to create ICP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/icp">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create ICP</h1>
          <p className="text-muted-foreground">
            Define your ideal customer profile to target the right leads
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ICP Details</CardTitle>
          <CardDescription>
            Provide information about your ideal customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">ICP Name *</Label>
              <Input
                id="name"
                placeholder="e.g., SaaS Founders in FinTech"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this ICP..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industries">Industries</Label>
              <Input
                id="industries"
                placeholder="e.g., FinTech, SaaS, E-commerce (comma separated)"
                value={formData.industries}
                onChange={(e) => setFormData({ ...formData, industries: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size</Label>
              <Input
                id="companySize"
                placeholder="e.g., 1-10, 11-50, 51-200 (comma separated)"
                value={formData.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roles">Target Roles</Label>
              <Input
                id="roles"
                placeholder="e.g., CEO, CTO, Head of Sales (comma separated)"
                value={formData.roles}
                onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="geography">Geography</Label>
              <Input
                id="geography"
                placeholder="e.g., USA, UK, Europe (comma separated)"
                value={formData.geography}
                onChange={(e) => setFormData({ ...formData, geography: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create ICP
              </Button>
              <Link href="/dashboard/icp">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
