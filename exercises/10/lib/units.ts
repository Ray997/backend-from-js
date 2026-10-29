// A helper for exercise 1 (you don't need to change this file).
export type Bytes = number;

export function formatSize(bytes: Bytes): string {
  return bytes < 1000 ? `${bytes} B` : `${(bytes / 1000).toFixed(1)} kB`;
}
