import prisma from "../src/lib/prisma";

async function check() {
  const orgs = await prisma.organization.findMany({
    include: {
      creditUsage: true,
      leads: true,
      subscription: true,
    },
  });

  console.log("=== ALL ORGANIZATIONS ===\n");
  
  for (const org of orgs) {
    console.log(`Org: ${org.name}`);
    console.log(`  Clerk ID: ${org.clerkId}`);
    console.log(`  Plan: ${org.subscription?.plan}`);
    console.log(`  Actual Leads in DB: ${org.leads.length}`);
    
    if (org.creditUsage.length > 0) {
      org.creditUsage.forEach((cu: any) => {
        console.log(`  Credit Usage (${cu.month}): ${cu.used} used, ${cu.lifetimeUsed} lifetime`);
      });
    } else {
      console.log(`  Credit Usage: NONE`);
    }
    
    if (org.leads.length !== (org.creditUsage[0]?.lifetimeUsed || 0)) {
      console.log(`  ⚠️  MISMATCH: ${org.leads.length} leads but ${org.creditUsage[0]?.lifetimeUsed || 0} credits used!`);
    }
    console.log("");
  }

  await prisma.$disconnect();
}

check();
