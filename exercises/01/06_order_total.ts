// Exercise 6 (project): Let the compiler find the bug
//
// This is plain JavaScript in a .ts file. Node runs it and prints:
//
//     Total: NaN4.99
//
// The order is 2 x 12.50 + 1 x 4.00 = 29.00, plus 4.99 shipping. WELCOME is not a real
// coupon, so there's no discount. The right answer is 33.99.
//
// Don't hunt for the bugs yourself. Make TypeScript find them:
//
// 1. Write two types:
//        type Item = { name: string; price: number; quantity: number };
//        type Order = { items: Item[]; shipping: number; coupon: string };
// 2. Annotate the parameters, and give discountFor the return type number:
//        discountFor(code: string): number        orderTotal(order: Order)
// 3. Give the order variable your Order type:   const order: Order = { ... }
// 4. Run tsc and fix what it finds. Repeat until it finds nothing.
//
// When it's fixed, it prints:
//
//     Total: 33.99
//
// Rules: no `any`, and keep the URLSearchParams line as it is (that's the checkout form).
//
// Run it:      node exercises/01/06_order_total.ts
// Check it:    pnpm check 01

export function discountFor(code) {
  if (code === "SAVE10") return 0.1;
  if (code === "SAVE20") return 0.2;
}

export function orderTotal(order) {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : order.shipping;
  return subtotal * (1 - discountFor(order.coupon)) + shipping;
}

const form = new URLSearchParams("shipping=4.99&coupon=WELCOME");
const order = {
  items: [
    { name: "Coffee beans", price: 12.5, quantity: 2 },
    { name: "Filter papers", price: 4, quantity: 1 },
  ],
  shipping: form.get("shipping"),
  coupon: form.get("coupon"),
};

console.log("Total:", orderTotal(order));
