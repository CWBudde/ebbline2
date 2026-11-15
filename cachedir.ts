import { tmpdir } from "node:os";
import { join } from "node:path";

// Vite's and Vitest's cache stay off the project drive: $EBBLINE2_VITE_CACHE or the system temp folder.
export function cacheDir(name: string): string {
  return join(
    process.env["EBBLINE2_VITE_CACHE"] ?? join(tmpdir(), "ebbline2-vite"),
    name,
  );
}
