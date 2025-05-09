// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */
import * as path from "path";
import { describe, it, expect } from "@jest/globals";

const CONTRACT_SRC = path.resolve(__dirname, "../src/CharacterRegistry.compact");
let tester: any;
try {
  tester = require("@midnight-ntwrk/compact-tester");
} catch (_err) {
  console.warn("compact-tester not found – skipping CharacterRegistry circuit tests.");
  describe.skip("CharacterRegistry circuits", () => {
    it("skipped", () => expect(true).toBe(true));
  });
}

if (tester) {
  describe("CharacterRegistry circuits", () => {
    const { buildSync } = tester as { buildSync: Function };
    const compiled = buildSync(CONTRACT_SRC);
    const { circuits, newContext } = compiled;

    it("registerCharacterHash then hasCharacter is true", async () => {
      const ctx = newContext({});
      const committedHash = "0xabc";

      // initially should be false
      let exists = await circuits.hasCharacter(ctx, { committedHash });
      expect(exists).toBe(false);

      await circuits.registerCharacterHash(ctx, { committedHash });

      exists = await circuits.hasCharacter(ctx, { committedHash });
      expect(exists).toBe(true);
    });
  });
} 