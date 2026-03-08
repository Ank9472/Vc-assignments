"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { companyById } from "@/lib/mockCompanies";
import { addCompanyToList, getLists, getNotes, setNotes, upsertList, getThesis } from "@/lib/storage";
import { scoreCompanyAgainstThesis } from "@/lib/scoring";
import { EnrichmentResult } from "@/lib/types";
import { ScorePill } from "@/components/score-pill";

export default function CompanyProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const company = id ? companyById.get(id) : undefined;

  const [note, setNote] = useState("");
  const [listName, setListName] = useState("Priority");
  const [listId, setListId] = useState("");
  const [lists, setLists] = useState<ReturnType<typeof getLists>>([]);
  const [listMessage, setListMessage] = useState("");
  const [enrichment, setEnrichment] = useState<EnrichmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const thesis = useMemo(() => getThesis(), []);
  const score = useMemo(() => {
    if (!company) {
      return null;
    }
    return scoreCompanyAgainstThesis(company, thesis);
  }, [company, thesis]);

  useEffect(() => {
    if (!company) {
      return;
    }
    const notes = getNotes();
    setNote(notes[company.id] ?? "");

    const lists = getLists();
    setLists(lists);
    if (lists[0]) {
      setListId(lists[0].id);
    }
  }, [company]);

  if (!company || !score) {
    return (
      <section className="card">
        <p>Company not found. Return to the companies table.</p>
        <Link className="button-link secondary" href="/companies">
          Back to companies
        </Link>
      </section>
    );
  }

  const selectedCompany = company;

  function saveNote() {
    const notes = getNotes();
    notes[selectedCompany.id] = note;
    setNotes(notes);
    setLastUpdated(new Date().toLocaleTimeString());
  }

  function createList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const list = upsertList(listName.trim());
    setLists(getLists());
    setListId(list.id);
    setListMessage(`List ready: ${list.name}`);
  }

  function saveToList() {
    if (!listId) {
      setListMessage("Select or create a list first");
      return;
    }
    addCompanyToList(listId, selectedCompany.id);
    setLists(getLists());
    setListMessage(`Added ${selectedCompany.name} to list`);
  }

  async function enrich() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          website: selectedCompany.website,
          companyName: selectedCompany.name
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = (await response.json()) as EnrichmentResult;
      setEnrichment(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Enrichment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section>
        <h1 className="page-title">{selectedCompany.name}</h1>
        <p className="page-description">{selectedCompany.description}</p>
      </section>

      <section className="card meta-grid">
        <div className="meta-item">
          <p className="meta-label">Sector</p>
          <p className="meta-value">{selectedCompany.sector}</p>
        </div>
        <div className="meta-item">
          <p className="meta-label">Stage</p>
          <p className="meta-value">{selectedCompany.stage}</p>
        </div>
        <div className="meta-item">
          <p className="meta-label">HQ</p>
          <p className="meta-value">{selectedCompany.hq}</p>
        </div>
        <div className="meta-item">
          <p className="meta-label">Thesis score</p>
          <p className="meta-value">
            <ScorePill score={score.total} />
          </p>
        </div>
      </section>

      <section className="grid-two">
        <div className="card">
          <div className="row" style={{ marginBottom: 8 }}>
            <strong>Signals timeline</strong>
            <span className="small">Newest first</span>
          </div>
          <div className="timeline">
            {selectedCompany.signals.map((signal) => (
              <div key={`${signal.date}-${signal.text}`} className="timeline-item">
                <strong>{signal.date}</strong>
                <p style={{ margin: "4px 0 0" }}>{signal.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <strong>Explainability</strong>
          <p className="small" style={{ marginTop: 8 }}>
            Score components: sector {score.sectorFit}, stage {score.stageFit}, model {score.modelFit},
            keywords {score.keywordFit}, penalties -{score.penalties}
          </p>
          <ul>
            {score.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid-two">
        <div className="card">
          <div className="row" style={{ marginBottom: 8 }}>
            <strong>Notes</strong>
            {lastUpdated ? <span className="small">Saved at {lastUpdated}</span> : null}
          </div>
          <textarea
            rows={6}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add investment angle, intro paths, risks"
          />
          <div style={{ marginTop: 10 }}>
            <button onClick={saveNote}>Save note</button>
          </div>
        </div>

        <div className="card">
          <strong>Save to list</strong>
          <form onSubmit={createList} style={{ marginTop: 10 }}>
            <input
              className="field"
              value={listName}
              onChange={(event) => setListName(event.target.value)}
              placeholder="Create list name"
            />
            <button type="submit" className="secondary" style={{ marginTop: 8 }}>
              Create or use list
            </button>
          </form>

          <select
            className="field"
            style={{ marginTop: 10 }}
            value={listId}
            onChange={(event) => setListId(event.target.value)}
          >
            <option value="">Select list</option>
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name} ({list.companyIds.length})
              </option>
            ))}
          </select>

          <button onClick={saveToList} style={{ marginTop: 8 }}>
            Save company to list
          </button>
          {listMessage ? <p className="small">{listMessage}</p> : null}
        </div>
      </section>

      <section className="card">
        <div className="row" style={{ marginBottom: 10 }}>
          <div>
            <strong>Live enrichment</strong>
            <p className="small" style={{ margin: "4px 0 0" }}>
              Pulls public pages in real time via server-side route.
            </p>
          </div>
          <button onClick={enrich} disabled={loading}>
            {loading ? "Enriching..." : "Enrich"}
          </button>
        </div>

        {error ? <p style={{ color: "#8b2a24" }}>{error}</p> : null}

        {enrichment ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <strong>Summary</strong>
              <p>{enrichment.summary}</p>
            </div>
            <div>
              <strong>What they do</strong>
              <ul>
                {enrichment.whatTheyDo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Keywords</strong>
              <div className="chips">
                {enrichment.keywords.map((keyword) => (
                  <span className="chip" key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <strong>Derived signals</strong>
              <ul>
                {enrichment.derivedSignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Sources</strong>
              <ul>
                {enrichment.sources.map((source) => (
                  <li key={source.url}>
                    {source.url} | {source.status} | {new Date(source.timestamp).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="small">No enrichment has been run yet.</p>
        )}
      </section>
    </>
  );
}
