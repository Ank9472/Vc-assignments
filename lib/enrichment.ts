import { EnrichmentResult } from "@/lib/types";

interface PageExtract {
  url: string;
  status: "ok" | "error";
  timestamp: string;
  text: string;
}

const STOPWORDS = new Set([
  "the",
  "and",
  "with",
  "from",
  "that",
  "this",
  "your",
  "their",
  "about",
  "have",
  "more",
  "into",
  "will",
  "than",
  "they",
  "them",
  "been",
  "were",
  "when",
  "where",
  "what",
  "which",
  "using",
  "build",
  "built",
  "platform"
]);

export function buildCandidateUrls(baseUrl: string): string[] {
  const normalized = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return [normalized, `${normalized}/about`, `${normalized}/product`, `${normalized}/careers`, `${normalized}/blog`];
}

function cleanText(raw: string): string {
  return raw
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchViaFirecrawl(url: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"]
    })
  });

  if (!response.ok) {
    throw new Error(`Firecrawl failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    data?: {
      markdown?: string;
    };
  };

  return payload.data?.markdown ?? "";
}

async function fetchPageText(url: string): Promise<PageExtract> {
  const timestamp = new Date().toISOString();
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;

  try {
    let text = "";
    if (firecrawlKey) {
      text = await fetchViaFirecrawl(url, firecrawlKey);
    } else {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 VC-Scout/1.0"
        },
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(`Fetch failed (${response.status})`);
      }
      const html = await response.text();
      text = cleanText(html);
    }

    return {
      url,
      status: "ok",
      timestamp,
      text: text.slice(0, 10000)
    };
  } catch {
    return {
      url,
      status: "error",
      timestamp,
      text: ""
    };
  }
}

function topKeywords(text: string, count: number): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOPWORDS.has(word));

  const frequency = new Map<string, number>();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  }

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

function sentenceSplit(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 40);
}

function deriveSignals(urls: string[], text: string): string[] {
  const signals: string[] = [];

  if (urls.some((url) => url.includes("careers"))) {
    signals.push("Careers page exists (hiring intent signal)");
  }
  if (urls.some((url) => url.includes("blog"))) {
    signals.push("Blog/news surface detected (content velocity signal)");
  }
  if (urls.some((url) => url.includes("product"))) {
    signals.push("Dedicated product page found (clear GTM articulation)");
  }
  if (/api|developer|docs/.test(text.toLowerCase())) {
    signals.push("Developer-oriented language present (integration readiness)");
  }

  return signals.slice(0, 4);
}

export async function enrichCompany(baseUrl: string, companyName: string): Promise<EnrichmentResult> {
  const urls = buildCandidateUrls(baseUrl);
  const pages = await Promise.all(urls.map((url) => fetchPageText(url)));
  const successful = pages.filter((page) => page.status === "ok");

  if (successful.length === 0) {
    return {
      summary: `No public text could be extracted from ${baseUrl}. Try again later or check the URL.`,
      whatTheyDo: ["Source pages were unreachable or blocked."],
      keywords: [],
      derivedSignals: [],
      sources: pages.map((page) => ({
        url: page.url,
        timestamp: page.timestamp,
        status: page.status
      }))
    };
  }

  const corpus = successful.map((page) => page.text).join(" ");
  const sentences = sentenceSplit(corpus);
  const summary =
    sentences.slice(0, 2).join(" ") ||
    `${companyName} appears active online with publicly crawlable product and company information.`;

  const whatTheyDo = sentences.slice(0, 6).map((sentence) => sentence.slice(0, 180));
  const keywords = topKeywords(corpus, 10);
  const derivedSignals = deriveSignals(urls, corpus);

  return {
    summary,
    whatTheyDo,
    keywords,
    derivedSignals,
    sources: pages.map((page) => ({
      url: page.url,
      timestamp: page.timestamp,
      status: page.status
    }))
  };
}
