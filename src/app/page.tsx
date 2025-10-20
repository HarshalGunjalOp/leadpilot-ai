import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Sparkles, Target, Zap } from "lucide-react";
import { GlobeDemo } from "@/components/magic-ui/globe-demo";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">LeadPilot AI</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 grain opacity-30" />
          <div className="container relative z-10">
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-20">
              <div className="flex flex-col justify-center space-y-8">
                <Badge className="w-fit" variant="secondary">
                  <Zap className="mr-1 h-3 w-3" />
                  AI-Powered Lead Generation
                </Badge>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                    Find Your Perfect{" "}
                    <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      Leads
                    </span>
                  </h1>
                  <p className="text-lg text-muted-foreground md:text-xl">
                    AI-enabled lead research and outbound engine. Build ICPs, discover qualified leads, and personalize outreach at scale.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/sign-up">
                    <Button size="lg" className="w-full magnetic-hover sm:w-auto">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      View Pricing
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>5 free leads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>No credit card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>2 min setup</span>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <GlobeDemo />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4">
                Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Everything you need to scale outbound
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From ICP definition to personalized sequences, we've got you covered.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
              <Card className="border-2 transition-all hover:shadow-lg">
                <CardHeader>
                  <Target className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>ICP Builder</CardTitle>
                  <CardDescription>
                    Define your ideal customer profile with precision targeting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Industry & company size filters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Tech stack detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Geographic targeting</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 transition-all hover:shadow-lg">
                <CardHeader>
                  <Sparkles className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>AI Research</CardTitle>
                  <CardDescription>
                    AI-powered lead scoring and personalization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Company fit scoring (1-5)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Buying signal extraction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Custom opening lines</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 transition-all hover:shadow-lg">
                <CardHeader>
                  <Zap className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>Sequences</CardTitle>
                  <CardDescription>
                    Build multi-touch email & LinkedIn campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Template library</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>AI variant generation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>CSV export</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4">
                Pricing
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Choose your plan
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start free, upgrade when you're ready to scale
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>Perfect for trying out LeadPilot</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>5 total leads</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Basic ICP builder</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>CSV export</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/sign-up" className="w-full">
                    <Button variant="outline" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="border-primary shadow-lg">
                <Badge className="absolute right-4 top-4">Popular</Badge>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>For growing sales teams</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$49</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>1,000 leads/month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>AI personalization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Sequence builder</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Tech stack detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/sign-up" className="w-full">
                    <Button className="w-full">Start Trial</Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>Custom solutions at scale</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Custom</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Unlimited leads</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Custom AI models</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>White-label options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Dedicated support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>SLA guarantee</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Contact Sales
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-bold">LeadPilot AI</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                AI-powered lead generation for modern sales teams
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/pricing" className="text-muted-foreground hover:text-primary">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Company</h3>
              <p className="text-sm text-muted-foreground">
                © 2025 LeadPilot AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
