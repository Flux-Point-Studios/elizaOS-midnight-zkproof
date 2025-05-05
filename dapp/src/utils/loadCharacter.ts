import { readFileSync } from "fs";

export function loadCharacter(path: string): any {
  const data = readFileSync(path, "utf-8");
  return JSON.parse(data);
} 