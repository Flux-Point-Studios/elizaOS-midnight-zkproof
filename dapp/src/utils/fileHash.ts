import { readFileSync } from "fs";
import { createHash } from "crypto";

export function fileHash(path: string): string {
  const bytes = readFileSync(path);
  return createHash("blake2b512").update(bytes).digest("hex");
} 