"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { authOrg, logAudit, withTransaction } from "@/lib/auth-helpers";
import { canGenerateLeads, getCurrentMonth } from "@/lib/utils";
import { getPlanConfig } from "@/config/plans";
import type { Lead } from "@prisma/client";
import {
  scrapeWebsite,
  extractDomain,
  guessLinkedInUrl,
} from "@/lib/scraper";
import {
  classifyCompanyFit,
  extractBuyingSignals,
  generatePersonalization,
  type ICPFilters,
} from "@/lib/openai";

export class PaywallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaywallError";
  }
}

export async function generateLeads(icpId: string, count: number = 10) {
  const { userId, organization } = await authOrg();

  // Get ICP
  const icp = await prisma.iCP.findFirst({
    where: { id: icpId, organizationId: organization.id },
  });

  if (!icp) {
    throw new Error("ICP not found");
  }

  // Check credit limits
  const currentMonth = getCurrentMonth();
  const usage = await prisma.leadCreditUsage.findUnique({
    where: {
      organizationId_month: {
        organizationId: organization.id,
        month: currentMonth,
      },
    },
  });

  const monthlyUsed = usage?.used || 0;
  const lifetimeUsed = usage?.lifetimeUsed || 0;

  const planConfig = getPlanConfig(organization.subscription?.plan || "FREE");
  const check = canGenerateLeads(
    organization.subscription?.plan || "FREE",
    monthlyUsed,
    lifetimeUsed
  );

  if (!check.allowed) {
    throw new PaywallError(check.reason!);
  }

  // Ensure we don't exceed limits
  const remainingMonthly =
    planConfig.limits.leadsPerMonth === -1
      ? count
      : Math.min(count, planConfig.limits.leadsPerMonth - monthlyUsed);

  const remainingLifetime =
    planConfig.limits.leadsLifetime === -1
      ? count
      : Math.min(count, planConfig.limits.leadsLifetime - lifetimeUsed);

  const actualCount = Math.min(remainingMonthly, remainingLifetime, count);

  if (actualCount <= 0) {
    throw new PaywallError("No remaining lead credits available");
  }

  // Get candidate companies (in production, this would query a database or API)
  const candidates = await getCandidateCompanies(
    icp.filters as ICPFilters,
    actualCount
  );

  // Process leads with AI
  const leads = await Promise.all(
    candidates.map(async (candidate) => {
      const domain = extractDomain(candidate.website);

      // Scrape website
      const scrapeData = await scrapeWebsite(candidate.website);

      // AI classification
      const fitResult = await classifyCompanyFit(
        {
          name: candidate.name,
          website: candidate.website,
          domain,
          industry: candidate.industry,
          description: scrapeData.description,
          techStack: scrapeData.techStack,
        },
        icp.filters as ICPFilters
      );

      // Extract signals
      const signals = await extractBuyingSignals(
        candidate.name,
        scrapeData.text
      );

      // Generate personalization
      const personalization = await generatePersonalization(
        {
          name: candidate.name,
          website: candidate.website,
          domain,
          industry: candidate.industry,
          techStack: scrapeData.techStack,
        },
        signals
      );

      return {
        companyName: candidate.name,
        website: candidate.website,
        domain,
        industry: candidate.industry,
        companySize: candidate.companySize,
        techStack: { technologies: scrapeData.techStack },
        signals: { pains: signals.pains, initiatives: signals.initiatives },
        aiScore: fitResult.score,
        personalization,
        linkedinUrl: guessLinkedInUrl(domain, candidate.name),
      };
    })
  );

  // Save leads and update usage in a transaction
  const result = await withTransaction(async (tx) => {
    const createdLeads = await tx.lead.createMany({
      data: leads.map((lead) => ({
        ...lead,
        organizationId: organization.id,
        icpId: icp.id,
      })),
    });

    await tx.leadCreditUsage.upsert({
      where: {
        organizationId_month: {
          organizationId: organization.id,
          month: currentMonth,
        },
      },
      update: {
        used: { increment: actualCount },
        lifetimeUsed: { increment: actualCount },
      },
      create: {
        organizationId: organization.id,
        month: currentMonth,
        used: actualCount,
        lifetimeUsed: lifetimeUsed + actualCount,
      },
    });

    return createdLeads;
  });

  // Log audit event
  await logAudit({
    organizationId: organization.id,
    actorId: userId,
    action: "generated_leads",
    entity: "lead",
    meta: { icpId, count: actualCount },
  });

  revalidatePath("/dashboard/leads");

  return { count: result.count, leads };
}

/**
 * Get candidate companies for lead generation
 * In production, this would query a real database or API
 */
async function getCandidateCompanies(
  _filters: ICPFilters,
  count: number
): Promise<
  Array<{
    name: string;
    website: string;
    industry: string;
    companySize: string;
  }>
> {
  // Demo seed data - in production, query from lead database or API
  const sampleCompanies = [
    {
      name: "Acme Corp",
      website: "https://acme.com",
      industry: "Software",
      companySize: "50-200",
    },
    {
      name: "TechStart Inc",
      website: "https://techstart.io",
      industry: "SaaS",
      companySize: "10-50",
    },
    {
      name: "CloudNine",
      website: "https://cloudnine.dev",
      industry: "Cloud Infrastructure",
      companySize: "200-500",
    },
    {
      name: "DataFlow Systems",
      website: "https://dataflow.io",
      industry: "Data Analytics",
      companySize: "50-200",
    },
    {
      name: "SecureNet",
      website: "https://securenet.co",
      industry: "Cybersecurity",
      companySize: "100-500",
    },
  ];

  // Return random sample
  const shuffled = sampleCompanies.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, sampleCompanies.length));
}

export async function exportLeadsCSV(leadIds: string[]) {
  const { organization } = await authOrg();

  const leads = await prisma.lead.findMany({
    where: {
      id: { in: leadIds },
      organizationId: organization.id,
    },
  });

  // Generate CSV
  const headers = [
    "Company",
    "Website",
    "Domain",
    "Industry",
    "Size",
    "Score",
    "Contact",
    "Email",
    "LinkedIn",
    "Personalization",
  ];

  const rows = leads.map((lead: Lead) => [
    lead.companyName,
    lead.website || "",
    lead.domain,
    lead.industry || "",
    lead.companySize || "",
    lead.aiScore.toString(),
    lead.contactName || "",
    lead.email || "",
    lead.linkedinUrl || "",
    lead.personalization || "",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row: string[]) =>
      row.map((cell: string) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csv;
}
