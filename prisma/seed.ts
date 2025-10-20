import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { clerkId: "demo_org_123" },
    update: {},
    create: {
      clerkId: "demo_org_123",
      name: "Demo Company",
      slug: "demo-company",
    },
  });

  console.log("✅ Created organization:", org.name);

  // Create subscription
  const subscription = await prisma.subscription.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      stripeCustomerId: `cus_demo_${org.id}`,
      plan: "FREE",
      status: "ACTIVE",
    },
  });

  console.log("✅ Created subscription:", subscription.plan);

  // Create demo ICP
  const icp = await prisma.iCP.create({
    data: {
      organizationId: org.id,
      name: "B2B SaaS Companies",
      description: "Growing SaaS companies in North America",
      createdBy: "demo_user_123",
      filters: {
        industries: ["Software", "SaaS", "Technology"],
        companySize: ["10-50", "50-200"],
        techStack: ["React", "Next.js", "Stripe"],
        roles: ["CEO", "CTO", "VP Sales"],
        geo: ["United States", "Canada"],
      },
    },
  });

  console.log("✅ Created ICP:", icp.name);

  // Create demo leads
  const demoLeads = [
    {
      companyName: "Acme SaaS Inc",
      domain: "acme-saas.com",
      website: "https://acme-saas.com",
      industry: "Software",
      companySize: "50-200",
      aiScore: 5,
      personalization:
        "I noticed Acme SaaS recently launched their new product suite and wanted to discuss how we help SaaS companies scale their outbound...",
      techStack: { technologies: ["React", "Node.js", "Stripe"] },
      signals: {
        pains: ["Scaling outbound", "Lead quality"],
        initiatives: ["Expanding sales team", "New market entry"],
      },
      contactName: "Jane Smith",
      email: "jane@acme-saas.com",
      linkedinUrl: "https://linkedin.com/company/acme-saas",
      status: "new",
    },
    {
      companyName: "TechFlow Solutions",
      domain: "techflow.io",
      website: "https://techflow.io",
      industry: "SaaS",
      companySize: "10-50",
      aiScore: 4,
      personalization:
        "Your recent blog post about AI in sales caught my attention. We're helping companies like TechFlow automate lead research...",
      techStack: { technologies: ["Next.js", "TypeScript", "PostgreSQL"] },
      signals: {
        pains: ["Manual prospecting", "Data quality"],
        initiatives: ["AI implementation", "Sales automation"],
      },
      contactName: "John Doe",
      email: "john@techflow.io",
      linkedinUrl: "https://linkedin.com/company/techflow",
      status: "new",
    },
    {
      companyName: "CloudBridge",
      domain: "cloudbridge.dev",
      website: "https://cloudbridge.dev",
      industry: "Cloud Infrastructure",
      companySize: "50-200",
      aiScore: 4,
      personalization:
        "CloudBridge's focus on developer tools aligns perfectly with our ICP. Let's discuss how we can help you find more qualified leads...",
      techStack: { technologies: ["React", "AWS", "Kubernetes"] },
      signals: {
        pains: ["Target audience reach", "Lead generation"],
        initiatives: ["Product launch", "Market expansion"],
      },
      contactName: "Sarah Johnson",
      email: "sarah@cloudbridge.dev",
      linkedinUrl: "https://linkedin.com/company/cloudbridge",
      status: "new",
    },
    {
      companyName: "DataFlow Analytics",
      domain: "dataflow.io",
      website: "https://dataflow.io",
      industry: "Data Analytics",
      companySize: "50-200",
      aiScore: 3,
      personalization:
        "Saw that DataFlow is expanding into enterprise. We specialize in helping analytics companies identify and reach decision-makers...",
      techStack: { technologies: ["Python", "React", "TensorFlow"] },
      signals: {
        pains: ["Enterprise sales", "Complex sales cycles"],
        initiatives: ["Enterprise focus", "Sales team growth"],
      },
      contactName: "Mike Chen",
      email: "mike@dataflow.io",
      linkedinUrl: "https://linkedin.com/company/dataflow",
      status: "new",
    },
    {
      companyName: "SecureNet Pro",
      domain: "securenet.co",
      website: "https://securenet.co",
      industry: "Cybersecurity",
      companySize: "100-500",
      aiScore: 5,
      personalization:
        "SecureNet's recent Series B shows strong market demand. I'd love to show you how we're helping cybersecurity companies scale outbound...",
      techStack: { technologies: ["React", "Go", "PostgreSQL"] },
      signals: {
        pains: ["Lead quality", "Sales efficiency"],
        initiatives: ["Series B growth", "Market expansion"],
      },
      contactName: "Emily Brown",
      email: "emily@securenet.co",
      linkedinUrl: "https://linkedin.com/company/securenet-pro",
      status: "new",
    },
  ];

  for (const leadData of demoLeads) {
    await prisma.lead.create({
      data: {
        ...leadData,
        organizationId: org.id,
        icpId: icp.id,
      },
    });
  }

  console.log(`✅ Created ${demoLeads.length} demo leads`);

  // Create demo sequence
  const sequence = await prisma.sequence.create({
    data: {
      organizationId: org.id,
      name: "Cold Outreach - SaaS",
      description: "Standard cold outreach sequence for SaaS companies",
      createdBy: "demo_user_123",
      steps: [
        {
          type: "email",
          day: 0,
          subject: "Quick question about {{company}}",
          body: "Hi {{first_name}},\n\n{{custom_first_line}}\n\nI help B2B SaaS companies like {{company}} generate more qualified leads using AI-powered research.\n\nWould you be open to a quick 15-min call next week?\n\nBest,\n[Your Name]",
        },
        {
          type: "linkedin",
          day: 2,
          subject: "",
          body: "Hi {{first_name}}, noticed we're both in the {{industry}} space. I'd love to connect and share some insights on lead generation.",
        },
        {
          type: "email",
          day: 5,
          subject: "Re: {{company}} + lead generation",
          body: "Hi {{first_name}},\n\nFollowing up on my previous email. I have a few ideas specific to {{company}} that could help with {{pain_point}}.\n\nDo you have 10 minutes this week?\n\nThanks,\n[Your Name]",
        },
      ],
    },
  });

  console.log("✅ Created sequence:", sequence.name);

  // Initialize credit usage
  const currentMonth = new Date().toISOString().substring(0, 7);
  await prisma.leadCreditUsage.create({
    data: {
      organizationId: org.id,
      month: currentMonth,
      used: demoLeads.length,
      lifetimeUsed: demoLeads.length,
    },
  });

  console.log("✅ Initialized credit usage");

  // Create audit log
  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      actorId: "demo_user_123",
      action: "seeded_data",
      entity: "system",
      meta: {
        leads: demoLeads.length,
        icps: 1,
        sequences: 1,
      },
    },
  });

  console.log("✅ Created audit log");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Organization: ${org.name}`);
  console.log(`   - Subscription: ${subscription.plan}`);
  console.log(`   - ICPs: 1`);
  console.log(`   - Leads: ${demoLeads.length}`);
  console.log(`   - Sequences: 1`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
