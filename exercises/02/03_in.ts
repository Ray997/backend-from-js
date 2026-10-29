// Exercise 3: Tell shapes apart with `in`
//
// A checkout accepts two kinds of payment. They have no property in common:
//
//     type Card = { cardNumber: string; expires: string };
//     type BankTransfer = { iban: string };
//
// The `in` operator from JavaScript checks whether an object has a property:
//
//     if ("iban" in payment) { ... }      // inside: payment is a BankTransfer
//
// TypeScript narrows on it, like on typeof.
//
// Finish describePayment(payment):
//     a card           -> "card ending in " + the last 4 digits     "card ending in 4242"
//     a bank transfer  -> "bank transfer from " + the first 4 characters of the IBAN
//                                                                    "bank transfer from TR33"
// Hint: "4111111111114242".slice(-4) is "4242", and "TR330006...".slice(0, 4) is "TR33".
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/02/03_in.ts
// Check it:    pnpm check 02

export type Card = { cardNumber: string; expires: string };
export type BankTransfer = { iban: string };
export type Payment = Card | BankTransfer;

export function describePayment(payment: Payment): string {
  return "card ending in " + payment.cardNumber.slice(-4); // <- tsc refuses: a BankTransfer has no cardNumber
}

console.log(describePayment({ cardNumber: "4111111111114242", expires: "09/29" }));
console.log(describePayment({ iban: "TR330006100519786457841326" }));
