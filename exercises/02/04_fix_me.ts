// Exercise 4: Fix me
//
// Node runs this file, prints a wrong answer, and then crashes.
// There are 4 mistakes. tsc finds 3 of them before anything runs:
//
//     npx tsc
//
// Fix those one by one. The 4th one is a bug tsc can't see, because the code is
// "type-correct": read what itemsLabel(0) prints, and compare it with the comment above it.
//
// When it's fixed, it prints:
//
//     true
//     /pricing
//     3
//     0 items
//     no cart yet
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/02/04_fix_me.ts
// Check it:    pnpm check 02

type Click = { type: "click"; x: number; y: number };
type PageView = { type: "pageview"; url: string };
type AppEvent = Click | PageView;

// Is this a page view of /pricing?
export function isPricingView(e: AppEvent): boolean {
  return e.type === "pageveiw" && e.url === "/pricing";
}

// The url of a page view. A click has no url: return "".
export function urlOf(e: AppEvent): string {
  return e.url;
}

// How many items? A cart arrives as a list, or as one text: "coffee,bagel,tea".
export function cartSize(items: string[] | string): number {
  if (typeof items === "array") {
    return items.length;
  }
  return items.split(",").length;
}

// null means there is no cart yet. 0 is a real cart with nothing in it: "0 items".
export function itemsLabel(count: number | null): string {
  if (!count) {
    return "no cart yet";
  }
  return `${count} items`;
}

const view: AppEvent = { type: "pageview", url: "/pricing" };
console.log(isPricingView(view));
console.log(urlOf(view));
console.log(cartSize(["coffee", "bagel", "tea"]));
console.log(itemsLabel(0));
console.log(itemsLabel(null));
