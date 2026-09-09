# `this`: the call site decides

Companion to [`this` in JavaScript: Why It Confuses Everyone, and the Rule That Fixes It](https://www.sahildurgia.dev/blog/this-in-javascript-explained).

```bash
node index.js
```

Runs in strict mode on purpose — sloppy mode silently binds `this` to the
global object and hides the very bug this is about.

The five binding cases, in priority order:

1. **method call** — `this` is the object before the dot;
2. **plain call** — `this` is `undefined`; shown both as a detached method and
   as the form you actually hit, passing a method as a callback;
3. **explicit** — `call`, `apply`, `bind`, and `bind` surviving detachment;
4. **arrow functions** — no `this` of their own, which fixes the callback case
   and breaks the method case; both are demonstrated;
5. **`new`** — binds `this` to the fresh object.

The arrow-as-a-method trap at the end is the one that bites people who learn
"arrows fix `this`" without the rest of the rule.
