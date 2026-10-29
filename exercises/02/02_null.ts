// Exercise 2: Check for null
//
// Lots of functions return "a value, or null when there is none". form.get("page") returns
// string | null: null when the field is missing. Check for null, and after that check
// TypeScript knows the value is a string.
//
//     const page = form.get("page");   // string | null
//     if (page === null) return 1;
//     page                             // string
//
// 1. pageFrom(form): the "page" field as a number. Missing -> 1.
//        pageFrom(new URLSearchParams("page=3"))   is 3
//        pageFrom(new URLSearchParams(""))         is 1
//
// 2. greeting(name): name can be a string, null or undefined.
//        greeting("Ada")      is "Hello, Ada"
//        greeting("  Ada ")   is "Hello, Ada"       (trim the name)
//        greeting(null)       is "Hello, guest"
//        greeting(undefined)  is "Hello, guest"
//        greeting("   ")      is "Hello, guest"     (nothing left after trimming)
//
// Rules: no `any`, no `as`, and no `!` after a value (like name!): that only tells TypeScript
// "trust me" and checks nothing.
//
// Run it:      node exercises/02/02_null.ts
// Check it:    pnpm check 02

export function pageFrom(form: URLSearchParams): number {
  const page = form.get("page");
  return Number(page); // <- runs, but a missing page becomes Number(null), which is 0
}

export function greeting(name: string | null | undefined): string {
  return "Hello, " + name.trim(); // <- tsc refuses: name is possibly null or undefined
}

console.log(pageFrom(new URLSearchParams("page=3")), pageFrom(new URLSearchParams("")));
console.log(greeting("  Ada "));
console.log(greeting(null));
