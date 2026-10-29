// A small module for exercise 4. Don't change this file.

/** The longest line of a text. */
export function longest(text: string): string {
  return text
    .trim()
    .split("\n")
    .reduce((best, line) => (line.length > best.length ? line : best), "");
}
