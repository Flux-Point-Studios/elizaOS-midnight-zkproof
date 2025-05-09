// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */
// Contract circuit tests powered by `@midnight-ntwrk/compact-tester`.
// These tests will be auto-skipped on CI machines that do not yet have the
// proprietary Midnight SDK available.  They provide full coverage when the
// SDK *is* present (developer workstations / dev-containers).

import * as path from "path";
import { expect, describe, it } from "@jest/globals";

// Resolve the compiled contract artefacts relative to project root.
const CONTRACT_SRC = path.resolve(__dirname, "../src/CharacterProof.compact");

let tester: any;
try {
  // Dynamically require so the absence of the package only impacts this file.
  // eslint-disable-next-line import/no-dynamic-require, global-require
  tester = require("@midnight-ntwrk/compact-tester");
} catch (err) {
  // The developer has not installed the Midnight SDK locally, or we are
  // running on CI.  Mark all circuit specs as skipped so the rest of the test
  // suite executes normally.
  console.warn("⚠️  `@midnight-ntwrk/compact-tester` not found – skipping contract circuit tests.");
  describe.skip("CharacterProof circuits (compact)", () => {
    it("skipped because compact-tester is unavailable", () => {
      expect(true).toBe(true);
    });
  });
}

// --- Real tests (executed when compact-tester is available) -----------------

if (tester) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  describe("CharacterProof circuits (compact)", () => {
    // Build once for the suite to keep runtime fast.
    const { buildSync } = tester as { buildSync: Function };
    const compiled = buildSync(CONTRACT_SRC);
    const { circuits, newContext } = compiled;

    // Helper to create default witness implementation
    const makeWitness = (character: any, committedHash: string) => ({
      getCharacter: () => character,
      // Provide deterministic commitment for convenience
      persistent_hash: () => committedHash,
    });

    it("proveTopic passes when topic exists", async () => {
      const ctx = newContext({});
      const topics = ["Cardano", "AI"];
      const char = { topics, lore: [], bio: [], knowledge: [] };
      const committedHash = "0xabc"; // Stub – real runtime will compute

      const result = await circuits.proveTopic(
        ctx,
        {
          topic: topics[0],
          committedHash,
        },
        makeWitness(char, committedHash)
      );

      expect(result.ok).toBe(true);
    });

    it("proveTopic rejects unknown topic", async () => {
      const ctx = newContext({});
      const char = { topics: ["Cardano"], lore: [], bio: [], knowledge: [] };
      const committedHash = "0xdead";

      await expect(
        circuits.proveTopic(
          ctx,
          {
            topic: "Solana",
            committedHash,
          },
          makeWitness(char, committedHash)
        )
      ).rejects.toThrow();
    });

    it("proveNoPhrase rejects if phrase present", async () => {
      const ctx = newContext({});
      const forbidden = "lorem";
      const char = {
        topics: [],
        lore: [forbidden],
        bio: [],
        knowledge: [],
      };
      const committedHash = "0xbeef";

      await expect(
        circuits.proveNoPhrase(
          ctx,
          {
            forbidden,
            committedHash,
          },
          makeWitness(char, committedHash)
        )
      ).rejects.toThrow();
    });
  });
} 