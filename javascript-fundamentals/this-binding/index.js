/**
 * `this`: the call site decides, not the definition site.
 * https://www.sahildurgia.dev/blog/this-in-javascript-explained
 *
 * Run: node index.js
 */

"use strict";

// The whole rule: look at HOW the function was called, not where it was
// written. The four cases below, in priority order, cover every case.

// ── 1. Method call — `this` is the object before the dot ────────────────────

const user = {
  name: "Sahil",
  greet() {
    return `Hi, ${this.name}`;
  },
};

console.log("1. method call:      ", user.greet()); // 'Hi, Sahil'

// ── 2. Plain call — `this` is undefined in strict mode ──────────────────────
// This is the bug people actually hit: pulling a method off its object, or
// passing it as a callback, detaches it from the call site that made it work.

const detached = user.greet;
try {
  detached();
} catch (err) {
  console.log("2. detached call:    ", err.constructor.name + " —", err.message);
}

// The same bug, in the form it usually appears:
try {
  [1].forEach(user.greet);
} catch (err) {
  console.log("   as a callback:    ", err.constructor.name);
}

// ── 3. Explicit binding — call / apply / bind ───────────────────────────────
// bind returns a new function with `this` locked in, which is the fix for the
// callback case above.

console.log("3. call:             ", user.greet.call({ name: "Ada" }));
console.log("   apply:            ", user.greet.apply({ name: "Grace" }));
const bound = user.greet.bind(user);
console.log("   bind:             ", bound());
console.log("   bind survives detach:", [1].map(bound)[0]);

// ── 4. Arrow functions have no `this` of their own ──────────────────────────
// They inherit it from the enclosing scope at definition time — which is why
// they fix the classic callback-loses-this problem, and why they must NOT be
// used for a method that needs `this` to be its own object.

const timer = {
  seconds: 0,
  startBroken() {
    // A plain function passed to setInterval is called plainly: `this` is not
    // the timer, so `this.seconds++` throws (strict) or silently writes to a
    // global (sloppy).
    return function () {
      return this;
    };
  },
  startFixed() {
    // The arrow captures `this` from startFixed, where it IS the timer.
    return () => {
      this.seconds++;
      return this.seconds;
    };
  },
};

console.log("4. plain fn in cb:   ", timer.startBroken()(), "(not the timer)");
const tick = timer.startFixed();
tick();
tick();
console.log("   arrow in cb:      ", timer.seconds, "(correct — arrow kept `this`)");

// The trap: an arrow as a METHOD captures the module/global scope, not the
// object, so it never sees its own properties.
const broken = {
  name: "nope",
  greet: () => `Hi, ${typeof this === "undefined" ? "undefined" : this.name}`,
};
console.log("   arrow as method:  ", broken.greet(), "(this is NOT `broken`)");

// ── 5. new binding ──────────────────────────────────────────────────────────
// `new` creates a fresh object and binds `this` to it. It outranks everything
// except bound functions created with bind.

function User(name) {
  this.name = name;
}
console.log("5. new:              ", new User("Linus").name);

/*
Expected output:

1. method call:       Hi, Sahil
2. detached call:     TypeError — Cannot read properties of undefined (reading 'name')
   as a callback:     TypeError
3. call:              Hi, Ada
   apply:             Hi, Grace
   bind:              Hi, Sahil
   bind survives detach: Hi, Sahil
4. plain fn in cb:    undefined (not the timer)
   arrow in cb:       2 (correct — arrow kept `this`)
   arrow as method:   Hi, undefined (this is NOT `broken`)
5. new:               Linus
*/
