// Exercise 2: Pick and Omit
//
//     Pick<T, K>     only the fields of T whose keys are in K       Pick<User, "id" | "name">
//     Omit<T, K>     every field of T, except the keys in K          Omit<User, "passwordHash">
//
// K is a union of keys, written as strings:  "id" | "name".
//
// A User, as it's stored on the server, has a password hash. It must never be sent to a browser.
//
// 1. PublicUser: a User without its passwordHash. Use Omit (don't copy the fields).
// 2. UserCard: only the id and the name, for a list of users. Use Pick.
// 3. toPublic(user): a copy of the user, without the passwordHash.
//    Hint: take it out with a rest pattern:  const { passwordHash, ...rest } = user;  then return rest.
// 4. toCard(user): only the id and the name.
//
// Careful: Pick checks its keys, Omit doesn't. Omit<User, "pasword"> is no error, and removes nothing.
// Hover over PublicUser to see what's really in it.
//
// When it's done, it prints:
//
//     { id: 'u1', name: 'Ana', email: 'ana@example.com' }
//     { id: 'u1', name: 'Ana' }
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/05/02_pick_omit.ts
// Check it:    pnpm check 05

export type User = { id: string; name: string; email: string; passwordHash: string };

export type PublicUser = User; // TODO
export type UserCard = User; // TODO

export function toPublic(user: User): PublicUser {
  return user; // TODO
}

export function toCard(user: User): UserCard {
  return user; // TODO
}

const ana: User = { id: "u1", name: "Ana", email: "ana@example.com", passwordHash: "x9f2k1" };
console.log(toPublic(ana));
console.log(toCard(ana));
