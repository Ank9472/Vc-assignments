import { Company, ScoreBreakdown, ThesisProfile } from "@/lib/types";

export function scoreCompanyAgainstThesis(
  company: Company,
  thesis: ThesisProfile
): ScoreBreakdown {
  let sectorFit = 0;
  let stageFit = 0;
  let modelFit = 0;
  let keywordFit = 0;
  let penalties = 0;
  const reasons: string[] = [];

  if (thesis.preferredSectors.includes(company.sector)) {
    sectorFit = 30;
    reasons.push(`Sector fit: ${company.sector} is in preferred sectors`);
  }

  if (thesis.preferredStages.includes(company.stage)) {
    stageFit = 25;
    reasons.push(`Stage fit: ${company.stage} is in preferred stages`);
  }

  if (thesis.preferredBusinessModels.includes(company.businessModel)) {
    modelFit = 20;
    reasons.push(`Business model fit: ${company.businessModel}`);
  }

  const searchableText = `${company.description} ${company.tags.join(" ")} ${company.subSector}`.toLowerCase();

  const positiveHits = thesis.mustHaveKeywords.filter((keyword) =>
    searchableText.includes(keyword.toLowerCase())
  );
  if (positiveHits.length > 0) {
    keywordFit = Math.min(25, positiveHits.length * 7);
    reasons.push(`Keyword fit: matched ${positiveHits.join(", ")}`);
  }

  const negativeHits = thesis.avoidKeywords.filter((keyword) =>
    searchableText.includes(keyword.toLowerCase())
  );
  if (negativeHits.length > 0) {
    penalties = Math.min(30, negativeHits.length * 10);
    reasons.push(`Penalty: matched excluded themes ${negativeHits.join(", ")}`);
  }

  const total = Math.max(0, Math.min(100, sectorFit + stageFit + modelFit + keywordFit - penalties));

  if (reasons.length === 0) {
    reasons.push("No strong thesis signals were detected yet");
  }

  return {
    total,
    sectorFit,
    stageFit,
    modelFit,
    keywordFit,
    penalties,
    reasons
  };
}
