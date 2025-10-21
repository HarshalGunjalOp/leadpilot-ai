import prisma from "../src/lib/prisma";

async function fixCredits() {
  console.log("🔧 Fixing credit usage for all organizations...\n");

  try {
    // Get all organizations
    const organizations = await prisma.organization.findMany({
      include: {
        creditUsage: true,
        leads: true,
      },
    });

    console.log(`📊 Found ${organizations.length} organization(s)\n`);

    for (const org of organizations) {
      console.log(`\n🏢 Organization: ${org.name} (${org.clerkId})`);
      
      // Count actual leads for this org
      const actualLeadCount = org.leads.length;
      console.log(`   📌 Actual leads in database: ${actualLeadCount}`);

      // Get current credit usage
      const currentMonth = new Date().toISOString().slice(0, 7);
      const creditUsage = org.creditUsage.find((cu: any) => cu.month === currentMonth);

      if (creditUsage) {
        console.log(`   💳 Current credit record: ${creditUsage.used} used, ${creditUsage.lifetimeUsed} lifetime`);
        
        // Update to match actual leads
        await prisma.leadCreditUsage.update({
          where: { id: creditUsage.id },
          data: {
            used: actualLeadCount,
            lifetimeUsed: actualLeadCount,
          },
        });
        
        console.log(`   ✅ FIXED: Set to ${actualLeadCount} used, ${actualLeadCount} lifetime`);
      } else {
        // No credit record exists, create one
        await prisma.leadCreditUsage.create({
          data: {
            organizationId: org.id,
            month: currentMonth,
            used: actualLeadCount,
            lifetimeUsed: actualLeadCount,
          },
        });
        
        console.log(`   ✅ CREATED: Credit record with ${actualLeadCount} used, ${actualLeadCount} lifetime`);
      }
    }

    console.log("\n\n🎉 All organizations fixed!");
    console.log("\n📋 Summary:");
    
    // Show final state
    const allCredits = await prisma.leadCreditUsage.findMany({
      include: {
        organization: {
          select: {
            name: true,
            clerkId: true,
          },
        },
      },
    });

    for (const credit of allCredits) {
      console.log(`   ${credit.organization.name}: ${credit.used} used, ${credit.lifetimeUsed} lifetime`);
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCredits()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ Script failed:", e);
    process.exit(1);
  });
