import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CompanyProfile {
  name: string;
  website: string;
  domain: string;
  industry?: string;
  description?: string;
  techStack?: string[];
}

export interface ICPFilters {
  industries?: string[];
  companySize?: string[];
  techStack?: string[];
  roles?: string[];
  geo?: string[];
}

export interface LeadSignals {
  pains: string[];
  initiatives: string[];
  confidence: number;
}

/**
 * Classify how well a company fits an ICP
 */
export async function classifyCompanyFit(
  company: CompanyProfile,
  icpFilters: ICPFilters,
  retries = 3
): Promise<{ score: number; reason: string }> {
  const prompt = `You are an expert B2B sales analyst. Evaluate how well this company matches the Ideal Customer Profile (ICP).

Company:
- Name: ${company.name}
- Industry: ${company.industry || "Unknown"}
- Website: ${company.website}
- Description: ${company.description || "No description"}
- Tech Stack: ${company.techStack?.join(", ") || "Unknown"}

ICP Criteria:
- Target Industries: ${icpFilters.industries?.join(", ") || "Any"}
- Company Size: ${icpFilters.companySize?.join(", ") || "Any"}
- Required Tech: ${icpFilters.techStack?.join(", ") || "Any"}
- Target Roles: ${icpFilters.roles?.join(", ") || "Any"}
- Regions: ${icpFilters.geo?.join(", ") || "Any"}

Rate the fit on a scale of 1-5:
1 = Poor fit
2 = Weak fit
3 = Moderate fit
4 = Strong fit
5 = Perfect fit

Respond with JSON only:
{
  "score": <number 1-5>,
  "reason": "<brief explanation in 1-2 sentences>"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      score: Math.min(Math.max(result.score || 1, 1), 5),
      reason: result.reason || "Unable to determine fit",
    };
  } catch (error) {
    if (retries > 0) {
      await sleep(1000);
      return classifyCompanyFit(company, icpFilters, retries - 1);
    }
    console.error("OpenAI classification error:", error);
    return { score: 3, reason: "Unable to classify - defaulted to moderate" };
  }
}

/**
 * Extract buying signals from company homepage text
 */
export async function extractBuyingSignals(
  companyName: string,
  homepageText: string,
  retries = 3
): Promise<LeadSignals> {
  const prompt = `You are a B2B sales intelligence analyst. Analyze this company's homepage content to identify:
1. Pain points or challenges they might be facing
2. Current initiatives or projects they're working on

Company: ${companyName}

Homepage Content:
${homepageText.substring(0, 2000)}

Respond with JSON only:
{
  "pains": ["<pain point 1>", "<pain point 2>"],
  "initiatives": ["<initiative 1>", "<initiative 2>"],
  "confidence": <number 0-100>
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      pains: result.pains || [],
      initiatives: result.initiatives || [],
      confidence: result.confidence || 50,
    };
  } catch (error) {
    if (retries > 0) {
      await sleep(1000);
      return extractBuyingSignals(companyName, homepageText, retries - 1);
    }
    console.error("OpenAI signals extraction error:", error);
    return { pains: [], initiatives: [], confidence: 0 };
  }
}

/**
 * Generate personalized opener for outreach
 */
export async function generatePersonalization(
  company: CompanyProfile,
  signals: LeadSignals,
  retries = 3
): Promise<string> {
  const prompt = `You are an expert sales copywriter. Write a personalized 1-2 sentence opener for a cold email to ${company.name}.

Context:
- Company: ${company.name}
- Industry: ${company.industry || "Unknown"}
- Pain points: ${signals.pains.join(", ") || "None identified"}
- Initiatives: ${signals.initiatives.join(", ") || "None identified"}

Write a compelling, specific opener that references their business and shows you've done research. Be conversational and avoid generic phrases.

Respond with just the personalized text, no JSON, no quotes.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    return (
      response.choices[0].message.content?.trim() ||
      `I noticed ${company.name} is in the ${company.industry || "industry"} space...`
    );
  } catch (error) {
    if (retries > 0) {
      await sleep(1000);
      return generatePersonalization(company, signals, retries - 1);
    }
    console.error("OpenAI personalization error:", error);
    return `I came across ${company.name} and wanted to reach out about how we help ${company.industry || "companies like yours"}...`;
  }
}

/**
 * Generate sequence variants using AI
 */
export async function generateSequenceVariants(
  originalSubject: string,
  originalBody: string,
  count: number = 3
): Promise<Array<{ subject: string; body: string }>> {
  const prompt = `You are an expert email copywriter. Generate ${count} variations of this cold email.

Original Subject: ${originalSubject}
Original Body: ${originalBody}

Create ${count} alternative versions that:
- Maintain the same core message
- Use different angles or hooks
- Keep the same tone
- Are equally compelling

Respond with JSON only:
{
  "variants": [
    {"subject": "...", "body": "..."},
    {"subject": "...", "body": "..."},
    {"subject": "...", "body": "..."}
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.variants || [];
  } catch (error) {
    console.error("OpenAI sequence generation error:", error);
    return [];
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
