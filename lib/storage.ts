import { CompanyList, SavedSearch, ThesisProfile } from "@/lib/types";
import { defaultThesis } from "@/lib/thesis";

const KEYS = {
  lists: "vc-intel-lists",
  savedSearches: "vc-intel-saved-searches",
  notes: "vc-intel-notes",
  thesis: "vc-intel-thesis"
} as const;

export function getSavedSearches(): SavedSearch[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(KEYS.savedSearches);
  return raw ? (JSON.parse(raw) as SavedSearch[]) : [];
}

export function setSavedSearches(searches: SavedSearch[]) {
  window.localStorage.setItem(KEYS.savedSearches, JSON.stringify(searches));
}

export function getLists(): CompanyList[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(KEYS.lists);
  return raw ? (JSON.parse(raw) as CompanyList[]) : [];
}

export function setLists(lists: CompanyList[]) {
  window.localStorage.setItem(KEYS.lists, JSON.stringify(lists));
}

export function getNotes(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }
  const raw = window.localStorage.getItem(KEYS.notes);
  return raw ? (JSON.parse(raw) as Record<string, string>) : {};
}

export function setNotes(notes: Record<string, string>) {
  window.localStorage.setItem(KEYS.notes, JSON.stringify(notes));
}

export function getThesis(): ThesisProfile {
  if (typeof window === "undefined") {
    return defaultThesis;
  }
  const raw = window.localStorage.getItem(KEYS.thesis);
  return raw ? (JSON.parse(raw) as ThesisProfile) : defaultThesis;
}

export function setThesis(thesis: ThesisProfile) {
  window.localStorage.setItem(KEYS.thesis, JSON.stringify(thesis));
}

export function upsertList(name: string): CompanyList {
  const lists = getLists();
  const existing = lists.find((list) => list.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    return existing;
  }

  const next: CompanyList = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    companyIds: []
  };
  setLists([next, ...lists]);
  return next;
}

export function addCompanyToList(listId: string, companyId: string) {
  const lists = getLists().map((list) => {
    if (list.id !== listId) {
      return list;
    }

    if (list.companyIds.includes(companyId)) {
      return list;
    }

    return {
      ...list,
      companyIds: [...list.companyIds, companyId]
    };
  });

  setLists(lists);
}
