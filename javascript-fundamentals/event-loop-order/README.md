# Event loop: microtasks vs macrotasks

Companion to [The Event Loop, Microtasks, and Macrotasks](https://www.sahildurgia.dev/blog/event-loop-microtasks-macrotasks).

```bash
node index.js
```

The post shows the four-line ordering puzzle. This file adds the parts that
explain *why* the ordering holds:

- microtasks queued **from inside** a draining microtask still run before the
  next timer, so the queue drains to empty rather than round-robining;
- `queueMicrotask` lands in the same queue as `.then`;
- everything after an `await` is a microtask continuation, so `async`/`await`
  obeys exactly the same rule;
- a commented-out `starve()` that shows how a self-queueing microtask can
  block timers and rendering indefinitely.

The expected output is written at the bottom of the file — run it and compare
before reading it.
