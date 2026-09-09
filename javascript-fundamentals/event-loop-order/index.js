/**
 * The event loop: why setTimeout(fn, 0) loses to a Promise callback.
 * https://www.sahildurgia.dev/blog/event-loop-microtasks-macrotasks
 *
 * Run: node index.js
 */

// ── 1. The snippet from the post ────────────────────────────────────────────
// The rule: all synchronous code runs first, then the ENTIRE microtask queue
// drains, and only then does one macrotask get to run.

console.log("1"); // sync
setTimeout(() => console.log("2"), 0); // macrotask
Promise.resolve().then(() => console.log("3")); // microtask
console.log("4"); // sync

// Output: 1, 4, 3, 2 — not 1, 2, 3, 4.

// ── 2. Microtasks drain COMPLETELY, including ones queued while draining ────
// This is the part that surprises people. A microtask that queues another
// microtask does not yield to the timer — the queue keeps draining until it
// is empty, so the timer waits behind all of them.

setTimeout(() => console.log("timer (macrotask)"), 0);

Promise.resolve().then(() => {
  console.log("micro 1");
  Promise.resolve().then(() => {
    console.log("micro 2 — queued from inside micro 1");
    Promise.resolve().then(() => console.log("micro 3 — still ahead of the timer"));
  });
});

// queueMicrotask is the same queue as Promise callbacks, without the promise.
queueMicrotask(() => console.log("queueMicrotask — same queue as .then"));

// ── 3. Starving the loop ────────────────────────────────────────────────────
// Because microtasks fully drain before the next macrotask, an endlessly
// self-queueing microtask blocks timers and rendering forever. Uncomment to
// hang the process — this is a real way to freeze a browser tab.
//
// function starve() { Promise.resolve().then(starve); }
// starve();

// ── 4. await is just .then ──────────────────────────────────────────────────
// Everything after an `await` is a microtask continuation, so it obeys the
// same ordering as the .then chain above.

async function demo() {
  console.log("async fn: before await (runs synchronously)");
  await null; // yields to the microtask queue
  console.log("async fn: after await (microtask)");
}
demo();

console.log("last synchronous line");

/*
Expected output:

1
4
async fn: before await (runs synchronously)
last synchronous line
3
micro 1
queueMicrotask — same queue as .then
async fn: after await (microtask)
micro 2 — queued from inside micro 1
micro 3 — still ahead of the timer
2
timer (macrotask)

Every microtask — including ones queued by other microtasks — comes out
before either timer, no matter that both timers were scheduled first.
*/
