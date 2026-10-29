// Exercise 4: Fix me
//
// There are 4 mistakes. tsc finds 2 of them right away:
//
//     npx tsc
//
// The other 2 hide from tsc:
// - nameOrGuest returns getName(id) inside a try, without await. The promise leaves the function before it fails,
//   so the catch never sees the failure: the program crashes instead of printing "guest".
// - cancel's .catch((err) => ...) callback: err is `any` there, even in strict mode (its type was written before
//   unknown existed). It reads err.message, but the reason is a string, so it prints undefined.
//   Narrow err, like a caught error.
//
// When it's fixed, it prints:
//
//     Ana has 2 orders
//     failed: no such user: u9
//     guest
//     cancelled: too slow
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/06/04_fix_me.ts
// Check it:    pnpm check 06

export type User = { id: string; name: string };
export type Order = { id: string; total: number };

const users: { [id: string]: User } = { u1: { id: "u1", name: "Ana" } };
const orders: { [id: string]: Order[] } = { u1: [{ id: "o1", total: 30 }, { id: "o2", total: 12.5 }] };

export async function getUser(id: string): Promise<User> {
  await new Promise((done) => setTimeout(done, 5));
  const user = users[id];
  if (!user) throw new Error(`no such user: ${id}`);
  return user;
}

export async function getOrders(id: string): Promise<Order[]> {
  await new Promise((done) => setTimeout(done, 5));
  return orders[id] ?? [];
}

export async function getName(id: string): Promise<string> {
  return (await getUser(id)).name;
}

// "Ana has 2 orders"
export async function summary(id: string): Promise<string> {
  const user = await getUser(id);
  const list = getOrders(id);
  return `${user.name} has ${list.length} orders`;
}

// the summary, or "failed: " and the reason
export async function report(id: string): Promise<string> {
  try {
    return await summary(id);
  } catch (e) {
    return `failed: ${e.message}`;
  }
}

// the user's name, or "guest" when that fails
export async function nameOrGuest(id: string): Promise<string> {
  try {
    return getName(id);
  } catch {
    return "guest";
  }
}

// a request that was cancelled, for a reason
export function cancel(reason: string): Promise<string> {
  return Promise.reject(reason).catch((err) => `cancelled: ${err.message}`);
}

console.log(await report("u1"));
console.log(await report("u9"));
console.log(await nameOrGuest("u9"));
console.log(await cancel("too slow"));
