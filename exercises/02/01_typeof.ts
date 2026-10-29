// Exercise 1: Narrow with typeof
//
// A union type is one of several types:  string | number  is a string OR a number.
// TypeScript only lets you use what works for EVERY member, so this line is refused:
//
//     id.toUpperCase()      Property 'toUpperCase' does not exist on type 'string | number'.
//
// Check first. Inside  if (typeof id === "string") { ... }  TypeScript knows id is a string,
// and after that if returns, it knows the rest can only be a number. That's narrowing.
//
// 1. formatId(id): an id from a URL is text, the same id from a database is a number.
//        a string -> trimmed, in capitals        formatId(" ab12 ")  is "AB12"
//        a number -> "#" + 5 digits, zero-padded  formatId(42)        is "#00042"
//    Hint: String(42).padStart(5, "0") is "00042".
//
// 2. toList(tags): a query string can send tags as one text ("a, b,c") or as a list (["a", "b"]).
//        a string -> split at commas, every tag trimmed    toList("a, b,c")    is ["a", "b", "c"]
//        a list   -> the same list                         toList(["x", "y"])  is ["x", "y"]
//    Hint: typeof can't tell you that something is an array (it says "object").
//          Array.isArray(tags) can, and TypeScript narrows on it too.
//
// Rules: keep the parameter types as they are, no `any`, no `as`.
//
// Run it:      node exercises/02/01_typeof.ts
// Check it:    pnpm check 02

export function formatId(id: string | number): string {
  return id.toUpperCase(); // <- tsc refuses this line: id could be a number.
}

export function toList(tags: string | string[]): string[] {
  return tags.split(","); // <- tsc refuses this line too.
}

console.log(formatId(" ab12 "), formatId(42));
console.log(toList("a, b,c"), toList(["x", "y"]));
