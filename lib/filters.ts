import { Company } from "@/lib/types";

export interface CompanyFilters {
  query: string;
  sector: string;
  stage: string;
  hq: string;
  tag: string;
}

export function filterCompanies(companies: Company[], filters: CompanyFilters): Company[] {
  return companies.filter((company) => {
    const searchable = `${company.name} ${company.description} ${company.tags.join(" ")} ${company.subSector}`.toLowerCase();
    const matchesQuery = filters.query.trim()
      ? searchable.includes(filters.query.trim().toLowerCase())
      : true;
    const matchesSector = filters.sector ? company.sector === filters.sector : true;
    const matchesStage = filters.stage ? company.stage === filters.stage : true;
    const matchesHq = filters.hq
      ? company.hq.toLowerCase().includes(filters.hq.toLowerCase())
      : true;
    const matchesTag = filters.tag
      ? company.tags.some((tag) => tag.toLowerCase().includes(filters.tag.toLowerCase()))
      : true;

    return matchesQuery && matchesSector && matchesStage && matchesHq && matchesTag;
  });
}
