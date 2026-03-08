"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";

const navItems = [
  { href: "/companies", label: "Companies" },
  { href: "/lists", label: "Lists" },
  { href: "/saved", label: "Saved Searches" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = useMemo(() => searchParams.get("q") ?? "", [searchParams]);
  const [globalQuery, setGlobalQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGlobalQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
      const inInput = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";
      if (inInput) {
        return;
      }

      if (event.key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (globalQuery.trim()) {
      params.set("q", globalQuery.trim());
    }
    router.push(`/companies?${params.toString()}`);
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">VC Intelligence</p>
          <h1 className="brand">Precision Scout</h1>
          <p className="subtitle">Thesis-first company discovery with explainable scoring.</p>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname.startsWith(item.href) ? "nav-item active" : "nav-item"}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <form onSubmit={onSubmit} className="global-search">
            <input
              ref={inputRef}
              value={globalQuery}
              onChange={(event) => setGlobalQuery(event.target.value)}
              placeholder="Search companies, tags, sectors, signals"
              aria-label="Global search"
            />
            <button type="submit">Search</button>
          </form>
          <div className="topbar-pill">Always-on thesis scout</div>
        </header>

        <div className="content">{children}</div>
      </main>
    </div>
  );
}
