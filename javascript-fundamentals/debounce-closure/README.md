# Closures: counters, private state, and debounce

Companion to [Closures Explained With Real, Non-Toy Examples](https://www.sahildurgia.dev/blog/closures-explained).

```bash
node index.js
```

Four steps, each building on the last:

1. `makeCounter` — state that persists between calls with no global;
2. two counters from the same factory, to show each closure gets its own binding;
3. `makeAccount` — private state behind a public interface;
4. `debounce`, and a runnable proof: six keystrokes 50ms apart into a 120ms
   debounce produce exactly one fetch.

The debounce is the payoff — `timeoutId` has to survive between calls but stay
private per debounced function, which is precisely the shape a closure gives
you.
