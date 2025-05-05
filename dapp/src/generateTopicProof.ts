// @ts-nocheck
import { DAppConnector } from "@midnight-ntwrk/dapp-connector-api";
import { fileHash } from "./utils/fileHash.js";
import { loadCharacter } from "./utils/loadCharacter.js";
import { CONTRACT_ADDR, RPC } from "./config.js";

export async function proveTopic(charPath: string, topic: string) {
  const character = loadCharacter(charPath);
  const h = fileHash(charPath);

  const connector = await DAppConnector.init({ rpcUrl: RPC });

  // Call contract entrypoint. The actual API name may differ; adjust when Compact docs confirm.
  const tx = await connector.invokeContract({
    address: CONTRACT_ADDR,
    functionName: "proveTopic",
    inputs: { topic, committedHash: h },
    witness: {
      getCharacter: () => character,
    },
  });

  const txHash = await connector.submitTx(tx);
  console.log(`✅ inclusion proof submitted → ${txHash}`);
  return txHash;
} 