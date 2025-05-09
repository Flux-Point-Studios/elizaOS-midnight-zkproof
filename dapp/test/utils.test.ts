import * as path from "path";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { fileHash } from "../src/utils/fileHash";
import { loadCharacter } from "../src/utils/loadCharacter";

const fixturePath = path.resolve(__dirname, "../fixtures/example.character.json");

describe("utils", () => {
  it("computes deterministic blake2b512 hash", () => {
    const expected = createHash("blake2b512").update(readFileSync(fixturePath)).digest("hex");
    expect(fileHash(fixturePath)).toBe(expected);
    expect(expected).toHaveLength(128); // 512-bit hex string
  });

  it("loads and parses character JSON", () => {
    const character = loadCharacter(fixturePath);
    expect(character.topics).toContain("Cardano");
    expect(character.lore).toEqual(["lorem"]);
    expect(character.bio[0]).toBe("ipsum");
  });
}); 