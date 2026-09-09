/**
 * Closures: private state, and the debounce that depends on it.
 * https://www.sahildurgia.dev/blog/closures-explained
 *
 * Run: node index.js
 */

// ── 1. A closure is just a function that remembers where it was created ─────
// `count` is not global and not a property on anything — it is unreachable
// except through the function returned below. That is the whole idea.

function makeCounter() {
  let count = 0;
  return () => ++count;
}

const counter = makeCounter();
console.log("counter:", counter(), counter(), counter()); // 1 2 3

// Each call to makeCounter creates a NEW binding, not a shared one.
const other = makeCounter();
console.log("independent counter:", other()); // 1

// ── 2. Private state with a public interface ────────────────────────────────
// The pre-`#private` way of making genuinely inaccessible fields.

function makeAccount(initial) {
  let balance = initial; // no way to reach this from outside
  return {
    deposit: (n) => (balance += n),
    withdraw: (n) => (n > balance ? "insufficient funds" : (balance -= n)),
    get balance() {
      return balance;
    },
  };
}

const account = makeAccount(100);
account.deposit(50);
console.log("balance:", account.balance); // 150
console.log("overdraft:", account.withdraw(500)); // insufficient funds
console.log("balance untouched:", account.balance); // 150

// ── 3. debounce — the closure that earns its keep ───────────────────────────
// `timeoutId` has to survive between calls but must not be shared between
// separate debounced functions. A closure is exactly that shape.

function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ── 4. Proving it ───────────────────────────────────────────────────────────
// Fire six "keystrokes" 50ms apart into a 120ms debounce. Only the last one
// should ever reach the handler.

const search = debounce((q) => console.log("  fetch:", q), 120);
const keystrokes = ["r", "re", "rea", "reac", "react", "react "];

console.log("debounce (120ms) fed a keystroke every 50ms:");
keystrokes.forEach((q, i) => setTimeout(() => search(q), i * 50));

/*
Expected output:

counter: 1 2 3
independent counter: 1
balance: 150
overdraft: insufficient funds
balance untouched: 150
debounce (120ms) fed a keystroke every 50ms:
  fetch: react

Six calls, one fetch. Every earlier timer was cleared by the next keystroke
because they all close over the same `timeoutId` — while a second debounced
function would get its own, because it would be a separate closure.
*/
