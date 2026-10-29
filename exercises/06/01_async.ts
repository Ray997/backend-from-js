// Exercise 1: Promise<T>, async functions, await, Promise.all
//
// An async function always returns a Promise<T>: a box that will hold a T later. await opens the box:
//
//     async function getUser(id: string): Promise<User>
//     const user = await getUser("u1");      // a User
//     const box = getUser("u1");             // a Promise<User> (no await: still the box)
//
// Promise.all starts several promises at once and waits for all of them. A list of promises goes in, and one
// promise of a tuple comes out (a tuple: an array with a fixed type at each position):
//
//     const [user, orders] = await Promise.all([getUser("u1"), getOrders("u1")]);   // User, Order[]
//
// "The library" below plays the API: don't change it. It answers after a short delay, like a real one.
//
// 1. orderTotal(id): the sum of the totals of the user's orders. Make it async: its return type is then
//    Promise<number>. Write that return type.
//        await orderTotal("u1")   is   42.5
// 2. loadProfile(id): the user's name, and how many orders they have. Return type: Promise<Profile>.
//        await loadProfile("u1")   is   { name: "Ana", orders: 2 }
//    The two requests don't depend on each other, so start both at once, with Promise.all.
//
// When it's done, it prints:
//
//     42.5
//     { name: 'Ana', orders: 2 }
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/06/01_async.ts
// Check it:    pnpm check 06

// ---- "the library": don't change it ----
export type User = { id: string; name: string };
export type Order = { id: string; total: number };

const users: { [id: string]: User } = { u1: { id: "u1", name: "Ana" }, u2: { id: "u2", name: "Mert" } };
const orders: { [id: string]: Order[] } = { u1: [{ id: "o1", total: 30 }, { id: "o2", total: 12.5 }], u2: [] };

/** How many requests are running right now, and the most that ever ran at the same time. */
export const requests = { running: 0, most: 0 };

async function answerLater<T>(answer: T): Promise<T> {
  requests.running++;
  requests.most = Math.max(requests.most, requests.running);
  await new Promise((done) => setTimeout(done, 20));
  requests.running--;
  return answer;
}

export async function getUser(id: string): Promise<User> {
  const user = users[id];
  if (!user) throw new Error(`no such user: ${id}`);
  return answerLater(user);
}

export async function getOrders(id: string): Promise<Order[]> {
  return answerLater(orders[id] ?? []);
}

// ---- your code ----
export type Profile = { name: string; orders: number };

export function orderTotal(id: string) {
  return 0; // TODO
}

export function loadProfile(id: string) {
  return { name: "", orders: 0 }; // TODO
}

console.log(await orderTotal("u1"));
console.log(await loadProfile("u1"));
