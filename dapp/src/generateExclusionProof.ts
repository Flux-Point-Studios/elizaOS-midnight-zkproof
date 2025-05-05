// @ts-nocheck
import { DAppConnector } from "@midnight-ntwrk/dapp-connector-api";
import { fileHash } from "./utils/fileHash.js";
import { loadCharacter } from "./utils/loadCharacter.js";
import { CONTRACT_ADDR, RPC } from "./config.js";

export async function proveExclusion(charPath: string, phrase: string) {
  const character = loadCharacter(charPath);
  const h = fileHash(charPath);

  const connector = await DAppConnector.init({ rpcUrl: RPC });

  const tx = await connector.invokeContract({
    address: CONTRACT_ADDR,
    functionName: "proveNoPhrase",
    inputs: { forbidden: phrase, committedHash: h },
    witness: {
      getCharacter: () => character,
    },
  });

  const txHash = await connector.submitTx(tx);
  console.log(`✅ exclusion proof submitted → ${txHash}`);
  return txHash;
} 