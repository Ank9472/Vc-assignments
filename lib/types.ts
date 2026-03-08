export type Stage = "Pre-Seed" | "Seed" | "Series A" | "Series B";

export interface Company {
  id: string;
  name: string;
  website: string;
  description: string;
  sector: string;
  subSector: string;
  stage: Stage;
  hq: string;
  businessModel: "B2B" | "B2C" | "B2B2C";
  foundedYear: number;
  employeeRange: string;
  tags: string[];
  signals: Array<{
    date: string;
    text: string;
    type: "product" | "hiring" | "funding" | "partnership" | "content";
  }>;
}

export interface ThesisProfile {
  preferredSectors: string[];
  preferredStages: Stage[];
  preferredBusinessModels: Array<Company["businessModel"]>;
  mustHaveKeywords: string[];
  avoidKeywords: string[];
}

export interface ScoreBreakdown {
  total: number;
  sectorFit: number;
  stageFit: number;
  modelFit: number;
  keywordFit: number;
  penalties: number;
  reasons: string[];
}

export interface SavedSearch {
  id: string;
  name: string;
  createdAt: string;
  query: string;
  sector: string;
  stage: string;
  hq: string;
  tag: string;
}

export interface CompanyList {
  id: string;
  name: string;
  createdAt: string;
  companyIds: string[];
}

export interface EnrichmentResult {
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  derivedSignals: string[];
  sources: Array<{
    url: string;
    timestamp: string;
    status: "ok" | "error";
  }>;
}
