import { Company } from "@/lib/types";

export const companies: Company[] = [
  {
    id: "aurora-ledger",
    name: "Aurora Ledger",
    website: "https://example.com",
    description:
      "Automates carbon accounting for multi-site manufacturers with ERP-native workflows.",
    sector: "Climate",
    subSector: "Carbon Intelligence",
    stage: "Seed",
    hq: "Berlin, Germany",
    businessModel: "B2B",
    foundedYear: 2023,
    employeeRange: "11-50",
    tags: ["climate", "erp", "compliance", "manufacturing"],
    signals: [
      {
        date: "2026-02-14",
        text: "Published integration docs for SAP and NetSuite connectors.",
        type: "product"
      },
      {
        date: "2026-01-20",
        text: "Opened roles for implementation engineers in DACH.",
        type: "hiring"
      }
    ]
  },
  {
    id: "sparkgrid-ai",
    name: "SparkGrid AI",
    website: "https://example.com",
    description:
      "Grid forecasting models that help utilities predict and prevent local outage risks.",
    sector: "Energy",
    subSector: "Grid Analytics",
    stage: "Series A",
    hq: "Austin, United States",
    businessModel: "B2B",
    foundedYear: 2021,
    employeeRange: "51-200",
    tags: ["energy", "ai", "utilities", "forecasting"],
    signals: [
      {
        date: "2026-02-22",
        text: "Announced pilot with a municipal utility in Texas.",
        type: "partnership"
      },
      {
        date: "2025-12-10",
        text: "Shipped storm-response model update in product changelog.",
        type: "content"
      }
    ]
  },
  {
    id: "clinicflow",
    name: "ClinicFlow",
    website: "https://example.com",
    description:
      "AI intake and scheduling workflow for independent specialty clinics.",
    sector: "Healthtech",
    subSector: "Clinical Ops",
    stage: "Pre-Seed",
    hq: "London, United Kingdom",
    businessModel: "B2B",
    foundedYear: 2024,
    employeeRange: "1-10",
    tags: ["healthtech", "workflow", "ai", "scheduling"],
    signals: [
      {
        date: "2026-02-02",
        text: "Released referral triage automation in beta.",
        type: "product"
      }
    ]
  },
  {
    id: "retail-twin",
    name: "RetailTwin",
    website: "https://example.com",
    description:
      "Digital twin platform that optimizes in-store layouts for conversion and basket size.",
    sector: "Commerce",
    subSector: "Retail Analytics",
    stage: "Seed",
    hq: "Toronto, Canada",
    businessModel: "B2B2C",
    foundedYear: 2022,
    employeeRange: "11-50",
    tags: ["retail", "analytics", "computer-vision", "conversion"],
    signals: [
      {
        date: "2026-02-25",
        text: "Shared case study showing 8 percent basket-size uplift.",
        type: "content"
      }
    ]
  },
  {
    id: "finpilot",
    name: "FinPilot",
    website: "https://example.com",
    description:
      "Treasury automation for mid-market CFO teams with proactive cash planning.",
    sector: "Fintech",
    subSector: "Treasury",
    stage: "Series B",
    hq: "Singapore",
    businessModel: "B2B",
    foundedYear: 2019,
    employeeRange: "201-500",
    tags: ["fintech", "treasury", "cfo", "automation"],
    signals: [
      {
        date: "2026-01-17",
        text: "Added API for multi-bank reconciliation.",
        type: "product"
      },
      {
        date: "2025-11-03",
        text: "Partnered with regional accounting platform.",
        type: "partnership"
      }
    ]
  },
  {
    id: "dockmind",
    name: "DockMind",
    website: "https://example.com",
    description:
      "Warehouse orchestration software for reducing dock congestion and truck idle time.",
    sector: "Logistics",
    subSector: "Warehouse Ops",
    stage: "Seed",
    hq: "Rotterdam, Netherlands",
    businessModel: "B2B",
    foundedYear: 2022,
    employeeRange: "11-50",
    tags: ["logistics", "warehouse", "optimization", "operations"],
    signals: [
      {
        date: "2026-02-07",
        text: "Published benchmark report on unloading cycle improvements.",
        type: "content"
      }
    ]
  },
  {
    id: "learnloom",
    name: "LearnLoom",
    website: "https://example.com",
    description:
      "Creator-led micro-learning platform with cohort monetization tools.",
    sector: "Edtech",
    subSector: "Creator Learning",
    stage: "Pre-Seed",
    hq: "Bengaluru, India",
    businessModel: "B2C",
    foundedYear: 2025,
    employeeRange: "1-10",
    tags: ["edtech", "creator", "learning", "community"],
    signals: [
      {
        date: "2026-02-18",
        text: "Launched creator referral rewards program.",
        type: "product"
      }
    ]
  },
  {
    id: "verge-bio",
    name: "VergeBio",
    website: "https://example.com",
    description:
      "Computational biology platform for target discovery in inflammatory disease.",
    sector: "Biotech",
    subSector: "Drug Discovery",
    stage: "Series A",
    hq: "Boston, United States",
    businessModel: "B2B",
    foundedYear: 2020,
    employeeRange: "51-200",
    tags: ["biotech", "drug-discovery", "models", "inflammation"],
    signals: [
      {
        date: "2026-02-11",
        text: "Published preclinical findings with academic collaborators.",
        type: "content"
      }
    ]
  },
  {
    id: "mesh-works",
    name: "MeshWorks",
    website: "https://example.com",
    description:
      "Workflow mesh for distributed frontline teams in construction and field services.",
    sector: "Future of Work",
    subSector: "Frontline SaaS",
    stage: "Seed",
    hq: "Madrid, Spain",
    businessModel: "B2B",
    foundedYear: 2021,
    employeeRange: "11-50",
    tags: ["future-of-work", "frontline", "construction", "workflow"],
    signals: [
      {
        date: "2026-02-01",
        text: "Added offline mode for low-connectivity job sites.",
        type: "product"
      }
    ]
  },
  {
    id: "orbit-payments",
    name: "Orbit Payments",
    website: "https://example.com",
    description:
      "Cross-border payouts infrastructure focused on creator and gig marketplaces.",
    sector: "Fintech",
    subSector: "Payments",
    stage: "Seed",
    hq: "Dubai, UAE",
    businessModel: "B2B2C",
    foundedYear: 2022,
    employeeRange: "11-50",
    tags: ["fintech", "payments", "marketplaces", "cross-border"],
    signals: [
      {
        date: "2026-02-27",
        text: "Expanded local payout rails to 3 new countries.",
        type: "product"
      }
    ]
  },
  {
    id: "helio-homes",
    name: "Helio Homes",
    website: "https://example.com",
    description:
      "Consumer software for optimizing residential solar usage and battery dispatch.",
    sector: "Climate",
    subSector: "Home Energy",
    stage: "Series A",
    hq: "Sydney, Australia",
    businessModel: "B2C",
    foundedYear: 2020,
    employeeRange: "51-200",
    tags: ["climate", "solar", "consumer", "energy"],
    signals: [
      {
        date: "2026-01-29",
        text: "Released new household savings simulator.",
        type: "product"
      }
    ]
  },
  {
    id: "nova-compliance",
    name: "Nova Compliance",
    website: "https://example.com",
    description:
      "Continuous compliance automation for fast-growing fintech and healthtech startups.",
    sector: "Security",
    subSector: "Compliance Automation",
    stage: "Series A",
    hq: "Dublin, Ireland",
    businessModel: "B2B",
    foundedYear: 2021,
    employeeRange: "51-200",
    tags: ["security", "compliance", "automation", "audit"],
    signals: [
      {
        date: "2026-02-09",
        text: "Launched trust center and self-serve evidence exports.",
        type: "product"
      }
    ]
  }
];

export const companyById = new Map(companies.map((company) => [company.id, company]));
