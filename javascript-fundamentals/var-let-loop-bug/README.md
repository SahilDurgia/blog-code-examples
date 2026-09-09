# var / let / const: the loop bug and the scoping rules behind it

Companion to [var, let, const: Scoping Rules Every Developer Must Actually Understand](https://www.sahildurgia.dev/blog/var-let-const-scoping).

```bash
node index.js
```

Covers, in order:

1. the `var` loop bug printing `3, 3, 3`;
2. the same loop with `let` printing `0, 1, 2`, because `for` + `let` creates a
   fresh binding per iteration;
3. the pre-ES6 IIFE workaround — worth seeing, because it makes concrete what
   `let` is doing for you now;
4. the temporal dead zone: `var` reads as `undefined`, `let` throws a
   `ReferenceError`;
5. `const` protecting the *binding*, not the value — the array still mutates.

Expected output is at the bottom of the file.
