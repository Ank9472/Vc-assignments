import { NextRequest, NextResponse } from "next/server";
import { enrichCompany } from "@/lib/enrichment";
import { companyById } from "@/lib/mockCompanies";
import { EnrichmentResult } from "@/lib/types";

const enrichmentCache = new Map<string, { payload: EnrichmentResult; cachedAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

interface EnrichRequestBody {
  companyId?: string;
  website?: string;
  companyName?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as EnrichRequestBody;

  const company = body.companyId ? companyById.get(body.companyId) : undefined;
  const website = body.website ?? company?.website;
  const companyName = body.companyName ?? company?.name ?? "Company";

  if (!website) {
    return NextResponse.json({ error: "A company website is required" }, { status: 400 });
  }

  const cacheKey = `${companyName}:${website}`;
  const cached = enrichmentCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return NextResponse.json(cached.payload, { status: 200 });
  }

  const payload = await enrichCompany(website, companyName);
  enrichmentCache.set(cacheKey, { payload, cachedAt: Date.now() });

  return NextResponse.json(payload, { status: 200 });
}
