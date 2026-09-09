import { useEffect, useState } from "react";
import { useDebouncedValue, useSearch } from "./useDebouncedValue.js";

/* ── BEFORE ──────────────────────────────────────────────────────────────────
   Everything in one component. It works, but the debounce timer, the fetch,
   the race guard and the render are all interleaved, so none of them can be
   read — or tested, or reused — on its own. */

export function SearchBoxBefore() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (debounced.length < 2) {
      setResults([]);
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setResults(data);
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {status === "loading" && <p>Searching…</p>}
      <ul>
        {results.map((r) => (
          <li key={r.id}>{r.title}</li>
        ))}
      </ul>
    </div>
  );
}

/* ── AFTER ───────────────────────────────────────────────────────────────────
   Identical behaviour. The component now says what it does rather than how,
   and the two hooks are independently reusable and testable. Nothing was
   abstracted away that you can't still read — the hooks are ten lines each. */

export function SearchBox() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const { status, results, error } = useSearch(debouncedQuery);

  return (
    <div>
      <label htmlFor="q">Search</label>
      <input id="q" value={query} onChange={(e) => setQuery(e.target.value)} />

      {status === "loading" && <p>Searching…</p>}
      {status === "error" && <p role="alert">{error.message}</p>}
      {status === "success" && results.length === 0 && <p>No matches for “{debouncedQuery}”.</p>}

      <ul>
        {results.map((r) => (
          <li key={r.id}>{r.title}</li>
        ))}
      </ul>
    </div>
  );
}

/* The payoff: a second component reuses the same debounce with no
   duplication, because the state lives per-caller rather than in the hook. */

export function TagFilter({ onCommit }) {
  const [tag, setTag] = useState("");
  const debouncedTag = useDebouncedValue(tag, 500);

  useEffect(() => {
    onCommit(debouncedTag);
  }, [debouncedTag, onCommit]);

  return <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Filter by tag" />;
}
