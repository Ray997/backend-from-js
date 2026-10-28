// Exercise 3: unknown means "prove it first"
//
// Data from outside your program (an environment variable, a config file, a request body)
// can be anything. Its honest type is `unknown`. TypeScript won't let you use an unknown
// value until you check what it is.
//
// A check like  if (typeof value === "number")  narrows the type: inside that if,
// TypeScript knows that value is a number.
//
// Finish portFrom(value):
//
//     a number            -> return it                  portFrom(8080)    is 8080
//     a string of digits  -> return it as a number      portFrom("3000")  is 3000
//     anything else       -> return 3000                portFrom("abc")   is 3000
//                                                       portFrom(null)    is 3000
//
// Rules: keep the parameter `unknown`, don't use `any`, and don't use `as`.
// Hints: /^\d+$/.test(text) is true only for a string of digits. Number("3000") is 3000.
//
// Run it:      node exercises/01/03_unknown.ts
// Check it:    pnpm check 01

export function portFrom(value: unknown): number {
  return value; // <- tsc refuses this line. Replace it.
}

console.log(portFrom(8080), portFrom("3000"), portFrom("abc"), portFrom(null));
