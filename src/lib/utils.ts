import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + "..." : str;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function parseVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, value);
  });
  return result;
}

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(prefix: string = ""): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function canGenerateLeads(
  plan: string,
  monthlyUsed: number,
  lifetimeUsed: number
): { allowed: boolean; reason?: string } {
  if (plan === "FREE") {
    if (lifetimeUsed >= 5) {
      return {
        allowed: false,
        reason: "Free plan limit reached. Upgrade to Pro for 1,000 leads/month.",
      };
    }
  } else if (plan === "PRO_MONTHLY" || plan === "PRO_YEARLY") {
    if (monthlyUsed >= 1000) {
      return {
        allowed: false,
        reason: "Monthly limit reached. Resets at billing period.",
      };
    }
  }
  return { allowed: true };
}
