// Exercise 1: Type parameters
//
// These functions work for any list, because they take `any`. But `any` switches the checks off:
// first(["a"]) gives `any` back, so TypeScript forgets that it's a string.
// A type parameter keeps the type: write it in angle brackets after the name, and use it like a type.
//
//     function first<T>(list: T[]): T | undefined
//
// Read it as: "for any type T, first takes a list of T and returns a T, or undefined".
// Every call fills in T: first([3, 1, 2]) has T = number, first(["a"]) has T = string.
//
// 1. Replace `any` in first with a type parameter T, like above.
//    Then hover over first in the console.log lines: first<number>, first<string>.
//
// 2. last(list): the last item of the list, or undefined when it's empty. Same signature as first.
//        last(["a", "b", "c"])   is "c"        last([])   is undefined
//
// 3. pair(a, b): returns the two values as an array, [a, b]. It needs two type parameters:
//        function pair<A, B>(a: A, b: B): [A, B]
//
// When it's done, it prints:
//
//     3 c
//     undefined undefined
//     [ 'port', 8080 ]
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/04/01_first.ts
// Check it:    pnpm check 04

export function first(list: any[]): any {
  return list[0];
}

export function last(list: any[]): any {
  return undefined; // TODO
}

export function pair(a: any, b: any): any {
  return []; // TODO
}

console.log(first([3, 1, 2]), last(["a", "b", "c"]));
console.log(first([]), last([]));
console.log(pair("port", 8080));
