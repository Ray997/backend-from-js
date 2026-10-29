// Exercise 1: Partial, Required, Readonly
//
// A utility type takes a type and builds a new type from it. TypeScript has them built in:
//
//     Partial<T>     the fields of T, every one optional (?)
//     Required<T>    the fields of T, none of them optional
//     Readonly<T>    the fields of T, every one readonly (lesson 03)
//
// They're generic types (lesson 04): T is the type you start from. Hover over one in VS Code to see
// how it's written.
//
// 1. withDefaults(overrides): the full settings. Every field the caller leaves out comes from DEFAULTS.
//    The caller may pass some of the fields, or none, so the parameter is a Partial<Settings>.
//        withDefaults({ port: 8080 })   is   { port: 8080, host: "localhost", debug: false }
//    Hint: spread DEFAULTS first, then the overrides on top:  { ...DEFAULTS, ...overrides }
//
// 2. DEFAULTS must never be changed by accident: give it the type Readonly<Settings>.
//
// 3. A signup form fills in its fields one at a time, so every field of a Draft is optional.
//    finish(draft): the draft as a Required<Draft> when every field is filled in, or undefined.
//        finish({ email: "ana@example.com", name: "Ana" })   is   { email: "ana@example.com", name: "Ana" }
//        finish({ email: "ana@example.com" })                is   undefined
//    Hint: check both fields, then build the object:  if (draft.email && draft.name) ...
//
// When it's done, it prints:
//
//     { port: 8080, host: 'localhost', debug: false }
//     { email: 'ana@example.com', name: 'Ana' } undefined
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/05/01_partial.ts
// Check it:    pnpm check 05

export type Settings = { port: number; host: string; debug: boolean };
export type Draft = { email?: string; name?: string };

export const DEFAULTS: Settings = { port: 3000, host: "localhost", debug: false };

export function withDefaults(overrides: unknown): Settings {
  return DEFAULTS; // TODO
}

export function finish(draft: Draft): Draft | undefined {
  return undefined; // TODO
}

console.log(withDefaults({ port: 8080 }));
console.log(finish({ email: "ana@example.com", name: "Ana" }), finish({ email: "ana@example.com" }));
