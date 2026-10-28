export function orderTotal(order) {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : order.shipping;
  return subtotal + shipping;
}

const form = new URLSearchParams("shipping=4.99");
const order = {
  items: [
    { name: "Coffee beans", price: 12.5, quantity: 2 },
    { name: "Filter papers", price: 4, quantity: 1 },
  ],
  shipping: form.get("shipping"),
};

console.log("Total:", orderTotal(order));
