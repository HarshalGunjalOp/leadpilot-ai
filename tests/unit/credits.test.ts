import { describe, it, expect } from "vitest";
import { canGenerateLeads, getCurrentMonth } from "@/lib/utils";

describe("Lead Credits", () => {
  it("should block free plan after 5 leads", () => {
    const result = canGenerateLeads("FREE", 0, 5);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Free plan limit");
  });

  it("should allow free plan under 5 leads", () => {
    const result = canGenerateLeads("FREE", 0, 3);
    expect(result.allowed).toBe(true);
  });

  it("should block pro plan after 1000 monthly leads", () => {
    const result = canGenerateLeads("PRO_MONTHLY", 1000, 5000);
    expect(result.allowed).toBe(false);
  });

  it("should allow pro plan under monthly limit", () => {
    const result = canGenerateLeads("PRO_MONTHLY", 500, 5000);
    expect(result.allowed).toBe(true);
  });
});

describe("Utils", () => {
  it("should format current month correctly", () => {
    const month = getCurrentMonth();
    expect(month).toMatch(/^\d{4}-\d{2}$/);
  });
});
