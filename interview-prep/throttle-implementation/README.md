# Debounce and throttle, with a harness that proves the difference

Companion to [Frontend Machine-Coding Round Prep](https://www.sahildurgia.dev/blog/frontend-machine-coding-round-prep).

```bash
node index.js
```

The two implementations from the post, plus the follow-ups an interviewer
reaches for once you've written the basic version:

- `debounce` / `throttle` — the core four-line answers;
- `debounceLeading` — fire on the leading edge, then suppress;
- `debounceWithControls` — `.cancel()` and `.flush()`, which is what a real
  library exposes and a common "now make it production-ready" follow-up;
- `throttleTrailing` — so the last event in a burst isn't dropped, the usual
  complaint about the naive throttle.

The harness fires 20 events 25ms apart into a 100ms window and counts what each
one lets through — debounce 1, throttle ~5. Being able to say *why* those
numbers differ is the actual thing being tested.
