/**
 * The classic var-in-a-loop closure bug, and the three ways to fix it.
 * https://www.sahildurgia.dev/blog/var-let-const-scoping
 *
 * Run: node index.js
 */

// ── The bug ─────────────────────────────────────────────────────────────────
// `var` is function-scoped, so all three callbacks close over the SAME `i`.
// By the time the timers fire, the loop has finished and that one shared
// binding holds 3.

console.log("var:");
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("  " + i), 0); // 3, 3, 3
}

// ── The fix ─────────────────────────────────────────────────────────────────
// `let` is block-scoped, and a `for` loop with `let` creates a FRESH binding
// per iteration — so each callback closes over its own copy.

setTimeout(() => {
  console.log("let:");
  for (let j = 0; j < 3; j++) {
    setTimeout(() => console.log("  " + j), 0); // 0, 1, 2
  }
}, 10);

// ── The pre-ES6 fix, for context ────────────────────────────────────────────
// Before `let`, you created a new scope by hand with an IIFE. This is exactly
// what `let` now does for you, per iteration.

setTimeout(() => {
  console.log("var + IIFE (how we did it before let):");
  for (var k = 0; k < 3; k++) {
    (function (captured) {
      setTimeout(() => console.log("  " + captured), 0); // 0, 1, 2
    })(k);
  }
}, 20);

// ── The temporal dead zone ──────────────────────────────────────────────────
// `var` hoists and initialises to undefined. `let`/`const` hoist too, but stay
// uninitialised until the declaration is reached — reading one before that
// throws rather than silently giving you undefined.

setTimeout(() => {
  console.log("temporal dead zone:");

  console.log("  var before declaration:", typeof hoistedVar, "(undefined, no error)");
  var hoistedVar = 1;

  try {
    // eslint-disable-next-line no-unused-vars, block-scoped-var
    console.log(tdzLet);
  } catch (err) {
    console.log("  let before declaration:", err.constructor.name + " —", err.message);
  }
  let tdzLet = 1;
  void tdzLet;
}, 30);

// ── const is about the binding, not the value ───────────────────────────────

setTimeout(() => {
  console.log("const:");
  const list = [1, 2];
  list.push(3); // fine — mutating the object, not rebinding the name
  console.log("  mutation allowed:", list.join(","));
  try {
    // eslint-disable-next-line no-const-assign
    eval("list = []");
  } catch (err) {
    console.log("  reassignment blocked:", err.constructor.name);
  }
}, 40);

/*
Expected output:

var:
  3
  3
  3
let:
  0
  1
  2
var + IIFE (how we did it before let):
  0
  1
  2
temporal dead zone:
  var before declaration: undefined (undefined, no error)
  let before declaration: ReferenceError — Cannot access 'tdzLet' before initialization
const:
  mutation allowed: 1,2,3
  reassignment blocked: TypeError
*/
