#!/usr/bin/env node
import { proveTopic } from "./generateTopicProof.js";
import { proveExclusion } from "./generateExclusionProof.js";
import { registerCharacter } from "./registerCharacter.js";

const [cmd, ...args] = process.argv.slice(2);

(async () => {
  try {
    switch (cmd) {
      case "prove-topic": {
        const [topic, path] = args;
        if (!topic || !path) throw new Error("Usage: prove-topic <topic> <character.json>");
        await proveTopic(path, topic);
        break;
      }
      case "prove-no": {
        const [phrase, path] = args;
        if (!phrase || !path) throw new Error("Usage: prove-no <phrase> <character.json>");
        await proveExclusion(path, phrase);
        break;
      }
      case "register": {
        const [path] = args;
        if (!path) throw new Error("Usage: register <character.json>");
        await registerCharacter(path);
        break;
      }
      default:
        console.log(`Unknown command ${cmd}`);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})(); 