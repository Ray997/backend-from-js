// A small module for exercise 1. Don't change this file: fix the imports in 01_imports.ts instead.

export type Money = { amount: number; currency: string };

export function formatMoney(money: Money): string {
  return `${money.amount.toFixed(2)} ${money.currency}`;
}

// The default export: one per module. It's imported without braces, under any name you like.
export default function sum(...items: Money[]): Money {
  const amount = items.reduce((total, item) => total + item.amount, 0);
  return { amount, currency: items[0]?.currency ?? "EUR" };
}
