// Exercise 3: Generic types
//
// A type can have type parameters too. An API that returns a long list sends it one page at a time,
// and a page looks the same whatever is on it: users, events, orders. So the page type takes the
// type of its items as a parameter:
//
//     type Page<T> = { items: T[]; page: number; pages: number };
//
// Page<User> is a page of users, Page<string> a page of strings.
//
// 1. Replace `unknown` in Page<T> with the object type above.
//    (page is the number of this page, starting at 1. pages is how many pages there are in all.)
//
// 2. paginate(items, page, size): one page of the list, with `size` items per page.
//        paginate(["a", "b", "c", "d", "e"], 2, 2)   is   { items: ["c", "d"], page: 2, pages: 3 }
//    Hint: items.slice((page - 1) * size, page * size), and pages is Math.ceil(items.length / size).
//
// 3. mapPage(p, fn): the same page, with fn applied to every item. Like Array's map, it needs two
//    type parameters: T for the items that go in, U for the items that come out.
//        function mapPage<T, U>(p: Page<T>, fn: (item: T) => U): Page<U>
//
// When it's done, it prints:
//
//     [ 'c', 'd' ] 2/3
//     [ 'C', 'D' ] 2/3
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/04/03_page.ts
// Check it:    pnpm check 04

export type Page<T> = unknown;

export function paginate<T>(items: T[], page: number, size: number): Page<T> {
  return { items: [], page, pages: 0 }; // TODO
}

export function mapPage(p: any, fn: (item: any) => any): any {
  return p; // TODO
}

const letters = paginate(["a", "b", "c", "d", "e"], 2, 2);
const upper = mapPage(letters, (s) => s.toUpperCase());
console.log(letters.items, `${letters.page}/${letters.pages}`);
console.log(upper.items, `${upper.page}/${upper.pages}`);
