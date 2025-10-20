/**
 * Scrape and analyze a website to build a company profile
 */
export async function scrapeWebsite(url: string): Promise<{
  title: string;
  description: string;
  text: string;
  techStack: string[];
}> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LeadPilotBot/1.0; +https://leadpilot.ai)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const title = extractTitle(html);
    const description = extractDescription(html);
    const text = extractText(html);
    const techStack = detectTechStack(html);

    return { title, description, text, techStack };
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return {
      title: "",
      description: "",
      text: "",
      techStack: [],
    };
  }
}

function extractTitle(html: string): string {
  const match =
    html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
    html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
  return match ? match[1].trim() : "";
}

function extractDescription(html: string): string {
  const match =
    html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i) ||
    html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
  return match ? match[1].trim() : "";
}

function extractText(html: string): string {
  // Remove scripts, styles, and HTML tags
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.substring(0, 5000); // Limit to first 5000 chars
}

/**
 * Detect technologies used on the website using heuristics
 */
export function detectTechStack(html: string): string[] {
  const detected: string[] = [];

  const patterns: Record<string, RegExp[]> = {
    React: [
      /__NEXT_DATA__/,
      /react/i,
      /_app-[a-f0-9]+\.js/,
      /react-dom/i,
    ],
    "Next.js": [/__NEXT_DATA__/, /_next\/static/, /next\.js/i],
    Vue: [/vue\.js/i, /__vue/i, /vue-router/i],
    Angular: [/ng-version/, /angular/i, /@angular/],
    WordPress: [/wp-content/, /wp-includes/, /wordpress/i],
    Shopify: [/cdn\.shopify\.com/, /shopify/i],
    Webflow: [/webflow/i, /wf-/],
    Stripe: [/js\.stripe\.com/, /stripe/i],
    "Google Analytics": [/google-analytics/, /gtag/, /ga\.js/],
    Cloudflare: [/cloudflare/i, /__cf_/],
    Vercel: [/vercel/i, /_vercel/],
    Netlify: [/netlify/i],
    Tailwind: [/tailwind/i, /tw-/],
    Bootstrap: [/bootstrap/i, /\bbs-/],
    jQuery: [/jquery/i, /\$\(/],
    TypeScript: [/\.ts"/, /typescript/i],
  };

  Object.entries(patterns).forEach(([tech, regexes]) => {
    if (regexes.some((regex) => regex.test(html))) {
      detected.push(tech);
    }
  });

  return detected;
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

/**
 * Guess LinkedIn company URL from domain
 */
export function guessLinkedInUrl(domain: string, companyName: string): string {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `https://www.linkedin.com/company/${slug}`;
}
