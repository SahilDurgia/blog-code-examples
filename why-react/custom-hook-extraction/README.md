# Extracting a custom hook

Companion to [React Hooks From First Principles](https://www.sahildurgia.dev/blog/react-hooks-first-principles).

Unlike the other folders here, this one is **React source rather than a Node
script** — there's nothing meaningful to `node index.js`. Drop the two files
into any React 18+ app, or read them in order.

## Files

- **`useDebouncedValue.js`** — two custom hooks:
  - `useDebouncedValue(value, delay)` — the minimal one. A `useState` and a
    `useEffect`, and nothing else.
  - `useSearch(query)` — the same pattern carrying an async request and its
    three states, including the `cancelled` flag that stops a slow response to
    an old query overwriting a fast response to a new one.
- **`SearchBox.jsx`** — the same component written twice:
  - `SearchBoxBefore` — all four concerns interleaved in one body;
  - `SearchBox` — identical behaviour, built from the two hooks;
  - `TagFilter` — a second consumer, to show the state is per-caller.

## The point

A custom hook is not an abstraction layer. It's a function that happens to call
other hooks, and it gets two things a plain helper function cannot:

1. **state tied to the component instance** — every caller gets its own, which
   is why `SearchBox` and `TagFilter` don't interfere;
2. **cleanup tied to the component lifecycle** — the `return () =>
   clearTimeout(id)` runs on unmount and before every re-run.

That's the whole mechanism. Both hooks here are about ten lines, and that's
deliberate: if extracting one makes the code harder to follow, it wasn't worth
extracting.
