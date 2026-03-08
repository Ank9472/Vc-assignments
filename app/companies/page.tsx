"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { companies } from "@/lib/mockCompanies";
import { filterCompanies } from "@/lib/filters";
import {
  addCompanyToList,
  getSavedSearches,
  getThesis,
  setSavedSearches,
  setThesis,
  upsertList
} from "@/lib/storage";
import { scoreCompanyAgainstThesis } from "@/lib/scoring";
import { SavedSearch, ThesisProfile } from "@/lib/types";
import { ScorePill } from "@/components/score-pill";

type SortKey = "name" | "stage" | "sector" | "score";

const PAGE_SIZE = 6;

function sortableValue(sortKey: Exclude<SortKey, "score">, company: (typeof companies)[number]): string {
  if (sortKey === "name") return company.name;
  if (sortKey === "stage") return company.stage;
  return company.sector;
}

export default function CompaniesPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [sector, setSector] = useState(searchParams.get("sector") ?? "");
  const [stage, setStage] = useState(searchParams.get("stage") ?? "");
  const [hq, setHq] = useState(searchParams.get("hq") ?? "");
  const [tag, setTag] = useState(searchParams.get("tag") ?? "");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [saveState, setSaveState] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkListName, setBulkListName] = useState("Pipeline");
  const [bulkMessage, setBulkMessage] = useState("");
  const [thesisDraft, setThesisDraft] = useState<ThesisProfile>(getThesis());
  const [thesisSaved, setThesisSaved] = useState("");

  const thesis = thesisDraft;
  const companyMap = useMemo(() => new Map(companies.map((company) => [company.id, company])), []);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setSector(searchParams.get("sector") ?? "");
    setStage(searchParams.get("stage") ?? "");
    setHq(searchParams.get("hq") ?? "");
    setTag(searchParams.get("tag") ?? "");
    setPage(1);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const base = filterCompanies(companies, { query, sector, stage, hq, tag });
    return base
      .map((company) => ({
        company,
        score: scoreCompanyAgainstThesis(company, thesis).total
      }))
      .sort((a, b) => {
        const modifier = sortAsc ? 1 : -1;
        if (sortKey === "score") {
          return (a.score - b.score) * modifier;
        }
        const left = sortableValue(sortKey, a.company).toLowerCase();
        const right = sortableValue(sortKey, b.company).toLowerCase();
        return left.localeCompare(right) * modifier;
      });
  }, [hq, query, sector, sortAsc, sortKey, stage, tag, thesis]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setSelectedIds((previous: string[]) =>
      previous.filter((id: string) =>
        filtered.some((item: { company: { id: string } }) => item.company.id === id)
      )
    );
  }, [filtered]);

  const sectorOptions = Array.from(new Set(companies.map((company) => company.sector))).sort();
  const stageOptions = Array.from(new Set(companies.map((company) => company.stage)));

  function changeSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortAsc((current: boolean) => !current);
      return;
    }
    setSortKey(nextKey);
    setSortAsc(false);
  }

  function saveCurrentSearch() {
    const searches = getSavedSearches();
    const next: SavedSearch = {
      id: crypto.randomUUID(),
      name: `Scout ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      query,
      sector,
      stage,
      hq,
      tag
    };
    setSavedSearches([next, ...searches]);
    setSaveState("Search saved");
    setTimeout(() => setSaveState(""), 1800);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
      const inInput = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";
      if (inInput) {
        return;
      }

      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveCurrentSearch();
      }

      if (event.key.toLowerCase() === "a" && event.shiftKey) {
        event.preventDefault();
        selectAllFiltered();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filtered, hq, query, sector, stage, tag]);

  function toggleSelected(companyId: string) {
    setSelectedIds((current: string[]) =>
      current.includes(companyId)
        ? current.filter((id: string) => id !== companyId)
        : [...current, companyId]
    );
  }

  function selectVisible() {
    const ids = paginated.map((item: { company: { id: string } }) => item.company.id);
    setSelectedIds((current: string[]) => Array.from(new Set([...current, ...ids])));
  }

  function selectAllFiltered() {
    const ids = filtered.map((item: { company: { id: string } }) => item.company.id);
    setSelectedIds(Array.from(new Set(ids)));
  }

  function clearSelected() {
    setSelectedIds([]);
  }

  function bulkAddToList() {
    if (selectedIds.length === 0) {
      setBulkMessage("Select at least one company");
      return;
    }
    const list = upsertList(bulkListName.trim() || "Pipeline");
    selectedIds.forEach((companyId: string) => addCompanyToList(list.id, companyId));
    setBulkMessage(`Added ${selectedIds.length} companies to ${list.name}`);
    setTimeout(() => setBulkMessage(""), 1800);
  }

  function exportSelected(format: "csv" | "json") {
    if (selectedIds.length === 0) {
      setBulkMessage("Select at least one company to export");
      return;
    }

    const rows = selectedIds
      .map((id: string) => companyMap.get(id))
      .filter(
        (company: (typeof companies)[number] | undefined): company is (typeof companies)[number] =>
          Boolean(company)
      );

    const toCsv = (lines: string[][]) =>
      lines.map((line) => line.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");

    let payload = "";
    let type = "text/plain";
    let extension = format;

    if (format === "json") {
      payload = JSON.stringify(rows, null, 2);
      type = "application/json";
    } else {
      payload = toCsv([
        ["id", "name", "sector", "stage", "hq", "website"],
        ...rows.map((company: (typeof companies)[number]) => [
          company.id,
          company.name,
          company.sector,
          company.stage,
          company.hq,
          company.website
        ])
      ]);
      type = "text/csv";
    }

    const blob = new Blob([payload], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `selected-companies.${extension}`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function saveThesisDraft() {
    setThesis(thesisDraft);
    setThesisSaved("Thesis saved and scoring refreshed");
    setTimeout(() => setThesisSaved(""), 1800);
  }

  const availableSectors = Array.from(new Set(companies.map((company) => company.sector))).sort();
  const availableStages = Array.from(new Set(companies.map((company) => company.stage)));

  return (
    <>
      <section>
        <h1 className="page-title">Discover Companies</h1>
        <p className="page-description">
          Thesis-aligned sourcing with explainable matching and low-noise faceted discovery.
        </p>
      </section>

      <section className="card">
        <div className="row" style={{ marginBottom: 10 }}>
          <strong>Power actions</strong>
          <span className="small">Shortcuts: `S` save search, `Shift+A` select all filtered</span>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-start" }}>
          <button className="secondary" onClick={selectVisible}>
            Select visible
          </button>
          <button className="secondary" onClick={selectAllFiltered}>
            Select all filtered
          </button>
          <button className="secondary" onClick={clearSelected}>
            Clear selection
          </button>
          <input
            className="field"
            style={{ maxWidth: 240 }}
            value={bulkListName}
            onChange={(event) => setBulkListName(event.target.value)}
            placeholder="Bulk list name"
          />
          <button onClick={bulkAddToList}>Bulk add to list</button>
          <button className="secondary" onClick={() => exportSelected("csv")}>
            Export selected CSV
          </button>
          <button className="secondary" onClick={() => exportSelected("json")}>
            Export selected JSON
          </button>
          <span className="small">Selected: {selectedIds.length}</span>
          {bulkMessage ? <span className="small">{bulkMessage}</span> : null}
        </div>
      </section>

      <section className="card">
        <div className="row" style={{ marginBottom: 10 }}>
          <strong>Filters</strong>
          <div className="row" style={{ gap: 8 }}>
            <button className="secondary" onClick={saveCurrentSearch}>
              Save search
            </button>
            {saveState ? <span className="small">{saveState}</span> : null}
          </div>
        </div>

        <div className="filters">
          <input
            value={query}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
            placeholder="Keyword"
          />

          <select
            value={sector}
            onChange={(event) => {
              setPage(1);
              setSector(event.target.value);
            }}
          >
            <option value="">All sectors</option>
            {sectorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={stage}
            onChange={(event) => {
              setPage(1);
              setStage(event.target.value);
            }}
          >
            <option value="">All stages</option>
            {stageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <input
            value={hq}
            onChange={(event) => {
              setPage(1);
              setHq(event.target.value);
            }}
            placeholder="HQ contains"
          />

          <input
            value={tag}
            onChange={(event) => {
              setPage(1);
              setTag(event.target.value);
            }}
            placeholder="Tag contains"
          />
        </div>
      </section>

      <section className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>
                <button onClick={() => changeSort("name")}>Company</button>
              </th>
              <th>
                <button onClick={() => changeSort("sector")}>Sector</button>
              </th>
              <th>
                <button onClick={() => changeSort("stage")}>Stage</button>
              </th>
              <th>HQ</th>
              <th>
                <button onClick={() => changeSort("score")}>Thesis score</button>
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(({ company, score }) => (
              <tr key={company.id}>
                <td>
                  <input
                    aria-label={`Select ${company.name}`}
                    type="checkbox"
                    checked={selectedIds.includes(company.id)}
                    onChange={() => toggleSelected(company.id)}
                  />
                </td>
                <td>
                  <div>
                    <div style={{ fontWeight: 600 }}>{company.name}</div>
                    <div className="small">{company.subSector}</div>
                  </div>
                </td>
                <td>{company.sector}</td>
                <td>{company.stage}</td>
                <td>{company.hq}</td>
                <td>
                  <ScorePill score={score} />
                </td>
                <td>
                  <Link className="button-link secondary" href={`/companies/${company.id}`}>
                    Open profile
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination" style={{ marginTop: 12 }}>
          <button
            className="secondary"
            disabled={safePage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <span className="small">
            Page {safePage} / {pageCount}
          </span>
          <button
            className="secondary"
            disabled={safePage >= pageCount}
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
          >
            Next
          </button>
        </div>
      </section>

      <section className="card">
        <div className="row" style={{ marginBottom: 10 }}>
          <strong>Thesis editor</strong>
          <button className="secondary" onClick={saveThesisDraft}>
            Save thesis
          </button>
        </div>

        <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <p className="small" style={{ marginTop: 0 }}>
              Preferred sectors
            </p>
            <div className="chips">
              {availableSectors.map((value) => {
                const isActive = thesisDraft.preferredSectors.includes(value);
                return (
                  <button
                    key={value}
                    className="secondary"
                    onClick={() =>
                      setThesisDraft((current) => ({
                        ...current,
                        preferredSectors: isActive
                          ? current.preferredSectors.filter((sectorValue) => sectorValue !== value)
                          : [...current.preferredSectors, value]
                      }))
                    }
                    style={{
                      background: isActive ? "#d4efe7" : "white"
                    }}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <p className="small" style={{ marginTop: 0 }}>
              Preferred stages
            </p>
            <div className="chips">
              {availableStages.map((value) => {
                const isActive = thesisDraft.preferredStages.includes(value);
                return (
                  <button
                    key={value}
                    className="secondary"
                    onClick={() =>
                      setThesisDraft((current) => ({
                        ...current,
                        preferredStages: isActive
                          ? current.preferredStages.filter((stageValue) => stageValue !== value)
                          : [...current.preferredStages, value]
                      }))
                    }
                    style={{
                      background: isActive ? "#d4efe7" : "white"
                    }}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid-two" style={{ marginTop: 12 }}>
          <div>
            <label className="small">Must-have keywords (comma separated)</label>
            <input
              className="field"
              value={thesisDraft.mustHaveKeywords.join(", ")}
              onChange={(event) =>
                setThesisDraft((current) => ({
                  ...current,
                  mustHaveKeywords: event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                }))
              }
            />
          </div>

          <div>
            <label className="small">Avoid keywords (comma separated)</label>
            <input
              className="field"
              value={thesisDraft.avoidKeywords.join(", ")}
              onChange={(event) =>
                setThesisDraft((current) => ({
                  ...current,
                  avoidKeywords: event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                }))
              }
            />
          </div>
        </div>

        {thesisSaved ? <p className="small">{thesisSaved}</p> : null}
      </section>
    </>
  );
}
