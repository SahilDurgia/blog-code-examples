import { useEffect, useState } from "react";

/**
 * Returns `value`, but only after it has stopped changing for `delay` ms.
 * https://www.sahildurgia.dev/blog/react-hooks-first-principles
 *
 * This is the whole reason custom hooks exist. There is no new API here — it
 * is a useState and a useEffect, exactly as they'd sit inside the component.
 * Moving them behind a name does two things a helper function could not:
 * the state stays tied to the component instance that calls it, and the
 * cleanup stays tied to that component's lifecycle.
 */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    // The cleanup is the entire mechanism: every change cancels the previous
    // pending update, so only a pause longer than `delay` gets through.
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

/**
 * The same pattern, one step further: a hook that owns an async request and
 * the three states it can be in. Note the `cancelled` flag — without it, a
 * slow response from an old query can land after a fast response from a new
 * one and overwrite it. That race is the single most common bug in
 * hand-rolled data fetching.
 */
export function useSearch(query, { minLength = 2 } = {}) {
  const [state, setState] = useState({ status: "idle", results: [], error: null });

  useEffect(() => {
    if (query.length < minLength) {
      setState({ status: "idle", results: [], error: null });
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setState((s) => ({ ...s, status: "loading" }));

    fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        return res.json();
      })
      .then((results) => {
        if (!cancelled) setState({ status: "success", results, error: null });
      })
      .catch((error) => {
        if (cancelled || error.name === "AbortError") return;
        setState({ status: "error", results: [], error });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [query, minLength]);

  return state;
}
