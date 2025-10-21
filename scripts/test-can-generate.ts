import { canGenerateLeads, getPlanConfig } from "../src/config/plans";

console.log("=== Testing canGenerateLeads function ===\n");

// Test FREE plan with 0 used
const test1 = canGenerateLeads("FREE", 0, 0);
console.log("FREE plan, 0 used, 0 lifetime:");
console.log("  Result:", test1);
console.log("");

// Test FREE plan with 5 used
const test2 = canGenerateLeads("FREE", 0, 5);
console.log("FREE plan, 0 monthly, 5 lifetime:");
console.log("  Result:", test2);
console.log("");

// Test PRO_MONTHLY plan
const test3 = canGenerateLeads("PRO_MONTHLY", 0, 0);
console.log("PRO_MONTHLY plan, 0 used:");
console.log("  Result:", test3);
console.log("");

// Check FREE plan config
const freeConfig = getPlanConfig("FREE");
console.log("FREE plan config:");
console.log("  Monthly limit:", freeConfig.limits.leadsPerMonth);
console.log("  Lifetime limit:", freeConfig.limits.leadsLifetime);
