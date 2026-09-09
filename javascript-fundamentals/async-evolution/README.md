# Callbacks → Promises → async/await

Companion to [Synchronous vs Asynchronous JavaScript](https://www.sahildurgia.dev/blog/sync-vs-async-javascript).

```bash
node index.js
```

The post shows the three styles as separate snippets. Here they run against
**the same fake API**, so the comparison is like-for-like:

1. callbacks — the pyramid, with an error check at every level;
2. promises — flat chain, one `.catch` for the whole thing;
3. `async`/`await` — the same chain, read top to bottom;
4. the mistake `await` makes easy: three sequential awaits on independent work
   take ~3× as long as `Promise.all`, printed with real timings;
5. error handling — `try`/`catch` around `await`, and `Promise.allSettled` when
   you want every result including the failures.

The promise versions are built from the callback ones, which is worth reading
on its own: it's the adapter you write whenever you wrap an older API.
