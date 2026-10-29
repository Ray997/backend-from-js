// Exercise 4: Types from functions: typeof, ReturnType, Parameters, Awaited
//
// Sometimes the type you need belongs to a function you didn't write, and nobody exported it.
// You can still get it from the function:
//
//     typeof createSession                  the type of the function itself (written where a type goes)
//     ReturnType<typeof createSession>      what it returns
//     Parameters<typeof createSession>      its parameters, as a tuple; [0] is the first one
//     Awaited<P>                            what a Promise P gives you, after await
//
// (This typeof is not the one from lesson 02: that one runs, and gives you a string like "number".
//  In a type, typeof only exists for tsc.)
//
// createSession below plays "the library": don't change it.
//
// 1. Replace the copy SessionOptions with the type of createSession's first parameter:
//        Parameters<typeof createSession>[0]
// 2. Replace the copy Session with what createSession gives you after await:
//        Awaited<ReturnType<typeof createSession>>
// 3. longer(options): the same options, with twice the minutes.
//        longer({ userId: "u1", minutes: 30 })   is   { userId: "u1", minutes: 60 }
// 4. describe(session): "<userId> until <expires>", for example "u1 until 3600"
//
// When it's done, it prints:
//
//     u1 until 3600
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/05/04_functions.ts
// Check it:    pnpm check 05

// ---- "the library": it exports the function, but not its types ----
export async function createSession(options: { userId: string; minutes: number }) {
  return { id: `s-${options.userId}`, userId: options.userId, expires: options.minutes * 60 };
}

// ---- your code ----
// These two are copies, written by hand. Copies drift: when the library changes, they don't.
export type SessionOptions = { userId: string; minutes: number }; // TODO: get it from createSession
export type Session = { id: string; userId: string; expires: number }; // TODO: get it from createSession

export function longer(options: SessionOptions): SessionOptions {
  return options; // TODO
}

export function describe(session: Session): string {
  return ""; // TODO
}

const options: SessionOptions = { userId: "u1", minutes: 30 };
const session = await createSession(longer(options));
console.log(describe(session));
