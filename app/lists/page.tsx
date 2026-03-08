"use client";

import { useEffect, useMemo, useState } from "react";
import { companies } from "@/lib/mockCompanies";
import { CompanyList } from "@/lib/types";
import { getLists, setLists, upsertList } from "@/lib/storage";

function toCsv(lines: string[][]) {
  return lines
    .map((line) => line.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

export default function ListsPage() {
  const [lists, setListsState] = useState<CompanyList[]>([]);
  const [name, setName] = useState("Watchlist");

  useEffect(() => {
    setListsState(getLists());
  }, []);

  const companyMap = useMemo(() => new Map(companies.map((company) => [company.id, company])), []);

  function refresh() {
    setListsState(getLists());
  }

  function createList() {
    upsertList(name.trim() || "Untitled");
    refresh();
  }

  function removeFromList(listId: string, companyId: string) {
    const next = getLists().map((list) => {
      if (list.id !== listId) {
        return list;
      }
      return {
        ...list,
        companyIds: list.companyIds.filter((id) => id !== companyId)
      };
    });
    setLists(next);
    setListsState(next);
  }

  function exportList(list: CompanyList, format: "csv" | "json") {
    const rows = list.companyIds
      .map((id) => companyMap.get(id))
      .filter((company): company is NonNullable<typeof company> => Boolean(company));

    let payload = "";
    let type = "text/plain";
    let extension = format;

    if (format === "json") {
      payload = JSON.stringify(rows, null, 2);
      type = "application/json";
    } else {
      payload = toCsv([
        ["id", "name", "sector", "stage", "hq", "website"],
        ...rows.map((company) => [
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
    link.download = `${list.name.toLowerCase().replaceAll(" ", "-")}.${extension}`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <>
      <section>
        <h1 className="page-title">Lists</h1>
        <p className="page-description">Organize opportunities and export for IC memos or CRM imports.</p>
      </section>

      <section className="card row" style={{ alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label className="small">Create list</label>
          <input className="field" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <button onClick={createList}>Create list</button>
      </section>

      {lists.length === 0 ? (
        <section className="card">
          <p>No lists yet. Create one, then save companies from their profile page.</p>
        </section>
      ) : (
        lists.map((list) => (
          <section key={list.id} className="card">
            <div className="row">
              <div>
                <strong>{list.name}</strong>
                <p className="small" style={{ margin: "4px 0 0" }}>
                  {list.companyIds.length} companies
                </p>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="secondary" onClick={() => exportList(list, "csv")}>
                  Export CSV
                </button>
                <button className="secondary" onClick={() => exportList(list, "json")}>
                  Export JSON
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              {list.companyIds.length === 0 ? (
                <p className="small">List is empty.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Sector</th>
                      <th>Stage</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.companyIds.map((id) => {
                      const company = companyMap.get(id);
                      if (!company) {
                        return null;
                      }
                      return (
                        <tr key={id}>
                          <td>{company.name}</td>
                          <td>{company.sector}</td>
                          <td>{company.stage}</td>
                          <td>
                            <button
                              className="secondary"
                              onClick={() => removeFromList(list.id, id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        ))
      )}
    </>
  );
}
