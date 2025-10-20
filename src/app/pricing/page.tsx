import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your needs
          </p>
        </div>
        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
