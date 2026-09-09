/**
 * Callbacks -> Promises -> async/await, over the same fake API.
 * https://www.sahildurgia.dev/blog/sync-vs-async-javascript
 *
 * Run: node index.js
 */

// ── A tiny fake API, in both styles ─────────────────────────────────────────

const DB = {
  users: { 1: { id: 1, name: "Sahil" } },
  orders: { 1: [{ id: 91 }] },
  invoices: { 91: { id: 91, total: 4200 } },
};

// Node-style callback: (err, value)
function getUserCb(id, cb) {
  setTimeout(() => {
    const user = DB.users[id];
    user ? cb(null, user) : cb(new Error("no such user: " + id));
  }, 20);
}
function getOrdersCb(userId, cb) {
  setTimeout(() => cb(null, DB.orders[userId] ?? []), 20);
}
function getInvoiceCb(orderId, cb) {
  setTimeout(() => {
    const invoice = DB.invoices[orderId];
    invoice ? cb(null, invoice) : cb(new Error("no invoice for order " + orderId));
  }, 20);
}

// Promise versions, built from the callback ones.
const getUser = (id) => new Promise((res, rej) => getUserCb(id, (e, v) => (e ? rej(e) : res(v))));
const getOrders = (id) => new Promise((res, rej) => getOrdersCb(id, (e, v) => (e ? rej(e) : res(v))));
const getInvoice = (id) => new Promise((res, rej) => getInvoiceCb(id, (e, v) => (e ? rej(e) : res(v))));

// ── 1. Callbacks: the pyramid, and error handling at every level ────────────

function withCallbacks(done) {
  getUserCb(1, (err, user) => {
    if (err) return done(err);
    getOrdersCb(user.id, (err2, orders) => {
      if (err2) return done(err2);
      getInvoiceCb(orders[0].id, (err3, invoice) => {
        if (err3) return done(err3);
        console.log("1. callbacks    ->", invoice.total);
        done(null);
      });
    });
  });
}

// ── 2. Promises: flat chain, one error handler ──────────────────────────────

function withPromises() {
  return getUser(1)
    .then((user) => getOrders(user.id))
    .then((orders) => getInvoice(orders[0].id))
    .then((invoice) => console.log("2. promises     ->", invoice.total))
    .catch((err) => console.error("   failed:", err.message));
}

// ── 3. async/await: the same chain, read top to bottom ──────────────────────

async function withAsyncAwait() {
  try {
    const user = await getUser(1);
    const orders = await getOrders(user.id);
    const invoice = await getInvoice(orders[0].id);
    console.log("3. async/await  ->", invoice.total);
  } catch (err) {
    console.error("   failed:", err.message);
  }
}

// ── 4. The mistake async/await makes easy ───────────────────────────────────
// Sequential awaits on INDEPENDENT work waits for no reason. Promise.all runs
// them concurrently. Same results, roughly a third of the time.

async function sequentialVsParallel() {
  const t1 = Date.now();
  await getUser(1);
  await getUser(1);
  await getUser(1);
  const sequential = Date.now() - t1;

  const t2 = Date.now();
  await Promise.all([getUser(1), getUser(1), getUser(1)]);
  const parallel = Date.now() - t2;

  console.log(`4. sequential ~${sequential}ms vs Promise.all ~${parallel}ms`);
}

// ── 5. Errors surface differently ───────────────────────────────────────────

async function errorHandling() {
  try {
    await getUser(999); // rejects
  } catch (err) {
    console.log("5. await + try/catch caught:", err.message);
  }

  // Promise.allSettled when you want every result, failures included.
  const results = await Promise.allSettled([getUser(1), getUser(999)]);
  console.log("   allSettled:", results.map((r) => r.status).join(", "));
}

// Run them in order so the output is readable.
withCallbacks(async (err) => {
  if (err) return console.error(err);
  await withPromises();
  await withAsyncAwait();
  await sequentialVsParallel();
  await errorHandling();
});

/*
Expected output (timings vary a little):

1. callbacks    -> 4200
2. promises     -> 4200
3. async/await  -> 4200
4. sequential ~62ms vs Promise.all ~21ms
5. await + try/catch caught: no such user: 999
   allSettled: fulfilled, rejected
*/
