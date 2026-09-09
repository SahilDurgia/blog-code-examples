/**
 * Debounce and throttle: implementations, and a harness that proves the
 * difference between them.
 * https://www.sahildurgia.dev/blog/frontend-machine-coding-round-prep
 *
 * Run: node index.js
 */

// ── debounce ────────────────────────────────────────────────────────────────
// "Wait until the calls STOP, then run once."
// Every call cancels the pending one, so a continuous stream never fires.

function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ── throttle ────────────────────────────────────────────────────────────────
// "Run at most once per interval, whatever happens in between."
// A continuous stream fires steadily, on a fixed cadence.

function throttle(fn, interval) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      fn(...args);
    }
  };
}

// ── The versions interviewers usually follow up with ────────────────────────

// debounce with a leading edge: fire immediately, then suppress until quiet.
function debounceLeading(fn, delay) {
  let timeoutId;
  return (...args) => {
    if (timeoutId === undefined) fn(...args);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
    }, delay);
  };
}

// debounce with cancel/flush — what a real library exposes.
function debounceWithControls(fn, delay) {
  let timeoutId;
  let pendingArgs = null;

  const debounced = (...args) => {
    pendingArgs = args;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      pendingArgs = null;
      fn(...args);
    }, delay);
  };

  debounced.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = undefined;
    pendingArgs = null;
  };

  debounced.flush = () => {
    if (timeoutId === undefined || pendingArgs === null) return;
    clearTimeout(timeoutId);
    const args = pendingArgs;
    timeoutId = undefined;
    pendingArgs = null;
    fn(...args);
  };

  return debounced;
}

// throttle with a trailing call, so the final event isn't dropped.
function throttleTrailing(fn, interval) {
  let lastCall = 0;
  let timeoutId;
  return (...args) => {
    const now = Date.now();
    const remaining = interval - (now - lastCall);
    if (remaining <= 0) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
      lastCall = now;
      fn(...args);
    } else if (timeoutId === undefined) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = undefined;
        fn(...args);
      }, remaining);
    }
  };
}

// ── Proving the difference ──────────────────────────────────────────────────
// Fire 20 events, 25ms apart (500ms of continuous "scrolling"), into a 100ms
// debounce and a 100ms throttle, and count what each one lets through.

function runHarness() {
  const EVENTS = 20;
  const GAP = 25;
  const WINDOW = 100;

  const hits = { debounce: 0, throttle: 0, debounceLeading: 0, throttleTrailing: 0 };

  const d = debounce(() => hits.debounce++, WINDOW);
  const t = throttle(() => hits.throttle++, WINDOW);
  const dl = debounceLeading(() => hits.debounceLeading++, WINDOW);
  const tt = throttleTrailing(() => hits.throttleTrailing++, WINDOW);

  for (let i = 0; i < EVENTS; i++) {
    setTimeout(() => {
      d();
      t();
      dl();
      tt();
    }, i * GAP);
  }

  setTimeout(() => {
    console.log(`${EVENTS} events, one every ${GAP}ms, ${WINDOW}ms window:\n`);
    console.log("  debounce         ->", hits.debounce, "call(s)  — only after the stream stopped");
    console.log("  debounceLeading  ->", hits.debounceLeading, "call(s)  — fired immediately, then suppressed");
    console.log("  throttle         ->", hits.throttle, "call(s)  — steady cadence throughout");
    console.log("  throttleTrailing ->", hits.throttleTrailing, "call(s)  — same, plus the final event");
    console.log("\nRule of thumb: debounce for search-as-you-type and resize;");
    console.log("throttle for scroll position, mousemove, and rate limits.");

    // cancel / flush
    let flushed = null;
    const controlled = debounceWithControls((v) => (flushed = v), 1000);
    controlled("pending");
    controlled.flush();
    console.log("\n  flush() ran the pending call early ->", flushed);

    controlled("discarded");
    controlled.cancel();
    setTimeout(() => console.log("  cancel() dropped it     ->", flushed), 50);
  }, EVENTS * GAP + WINDOW * 2);
}

runHarness();

/*
Expected output (counts are stable, timings vary by a call or two):

20 events, one every 25ms, 100ms window:

  debounce         -> 1 call(s)  — only after the stream stopped
  debounceLeading  -> 1 call(s)  — fired immediately, then suppressed
  throttle         -> 5 call(s)  — steady cadence throughout
  throttleTrailing -> 6 call(s)  — same, plus the final event

Rule of thumb: debounce for search-as-you-type and resize;
throttle for scroll position, mousemove, and rate limits.

  flush() ran the pending call early -> pending
  cancel() dropped it     -> pending
*/
