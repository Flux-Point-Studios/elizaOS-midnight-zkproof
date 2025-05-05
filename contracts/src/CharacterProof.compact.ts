// @ts-nocheck

// Compiled by Midnight Compact compiler (TypeScript DSL)
// Contract proves inclusion/exclusion facts about an ElizaOS character.json

import { disclose, witness, hash } from "@midnight/compact";
import { contains } from "./lib/contains";

// ---- Types -------------------------------------------------------------
export type Character = {
  topics: string[];
  lore: string[];
  bio: string[];
  knowledge: { id: string; content: string }[];
};

// ---- Witness -----------------------------------------------------------
/**
 * Off-chain callback supplies the entire character.json at proof time.
 * NEVER exposed on-chain.
 */
export const getCharacter = witness<Character>("getCharacter");

// ---- Helper search -----------------------------------------------------

// ---- Entry circuits ----------------------------------------------------
/**
 * Prove that `topic` appears in character.topics.
 * Public inputs: committedHash, topic
 * Disclosure: committedHash, result (bool)
 */
export circuit proveTopic(topic: string, committedHash: string) {
  const char = getCharacter();

  // Integrity: assert private file hash matches committed hash
  assert(hash(char) === committedHash);

  const ok = contains(char.topics, topic);
  assert(ok); // transaction fails if topic absent

  disclose(committedHash);
  disclose(ok); // reveals only `true`
}

/**
 * Prove ABSENCE of a forbidden phrase in lore + bio + knowledge.
 */
export circuit proveNoPhrase(forbidden: string, committedHash: string) {
  const char = getCharacter();
  assert(hash(char) === committedHash);

  let bad = false;
  for (let i = 0; i < char.lore.length; i++) {
    if (char.lore[i].includes(forbidden)) bad = true;
  }
  for (let i = 0; i < char.bio.length; i++) {
    if (char.bio[i].includes(forbidden)) bad = true;
  }
  for (let i = 0; i < char.knowledge.length; i++) {
    if (char.knowledge[i].content.includes(forbidden)) bad = true;
  }

  // Must be absent
  assert(!bad);

  disclose(committedHash);
  disclose(!bad); // reveals `true`
} 