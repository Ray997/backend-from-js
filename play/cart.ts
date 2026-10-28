type Item = { name: string; price: number };

function total(items: Item[], tip: number): number {
  return items.reduce((sum, item) => sum + item.price, 0) + tip;
}

const cart: Item[] = [
  { name: "coffee", price: 4 },
  { name: "bagel", price: 3 },
];
console.log("Total:", total(cart, 2));
