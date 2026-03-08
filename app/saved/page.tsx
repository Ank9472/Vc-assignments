"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SavedSearch } from "@/lib/types";
import { getSavedSearches, setSavedSearches } from "@/lib/storage";

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    setSearches(getSavedSearches());
  }, []);

  function removeSearch(id: string) {
    const next = searches.filter((search) => search.id !== id);
    setSavedSearches(next);
    setSearches(next);
  }

  return (
    <>
      <section>
        <h1 className="page-title">Saved Searches</h1>
        <p className="page-description">Re-run thesis screens instantly and keep sourcing loops repeatable.</p>
      </section>

      {searches.length === 0 ? (
        <section className="card">
          <p>No saved searches yet. Save one from the companies page filters.</p>
        </section>
      ) : (
        searches.map((search) => {
          const params = new URLSearchParams();
          if (search.query) params.set("q", search.query);
          if (search.sector) params.set("sector", search.sector);
          if (search.stage) params.set("stage", search.stage);
          if (search.hq) params.set("hq", search.hq);
          if (search.tag) params.set("tag", search.tag);

          return (
            <section className="card" key={search.id}>
              <div className="row">
                <div>
                  <strong>{search.name}</strong>
                  <p className="small" style={{ margin: "4px 0 0" }}>
                    Created {new Date(search.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <Link className="button-link secondary" href={`/companies?${params.toString()}`}>
                    Re-run search
                  </Link>
                  <button className="secondary" onClick={() => removeSearch(search.id)}>
                    Delete
                  </button>
                </div>
              </div>

              <div className="chips" style={{ marginTop: 10 }}>
                {search.query ? <span className="chip">query: {search.query}</span> : null}
                {search.sector ? <span className="chip">sector: {search.sector}</span> : null}
                {search.stage ? <span className="chip">stage: {search.stage}</span> : null}
                {search.hq ? <span className="chip">hq: {search.hq}</span> : null}
                {search.tag ? <span className="chip">tag: {search.tag}</span> : null}
              </div>
            </section>
          );
        })
      )}
    </>
  );
}
