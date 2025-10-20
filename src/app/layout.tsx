import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeadPilot AI - AI-Powered Lead Research & Outbound Engine",
  description:
    "Generate qualified leads with AI-powered research, ICP matching, and personalized outreach sequences.",
  keywords: [
    "lead generation",
    "AI sales",
    "B2B leads",
    "outbound sales",
    "sales automation",
  ],
  authors: [{ name: "LeadPilot AI" }],
  openGraph: {
    title: "LeadPilot AI",
    description: "AI-Powered Lead Research & Outbound Engine",
    type: "website",
    url: "https://leadpilot.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadPilot AI",
    description: "AI-Powered Lead Research & Outbound Engine",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
