// @ts-nocheck
import { fileHash } from "./utils/fileHash.js";
import { DAppConnector } from "@midnight-ntwrk/dapp-connector-api";
import { RPC, CONTRACT_ADDR } from "./config.js";

export async function registerCharacter(charPath: string) {
  const h = fileHash(charPath);

  const connector = await DAppConnector.init({ rpcUrl: RPC });

  // For simplicity we call a fictitious registry function; you may deploy a separate contract.
  const tx = await connector.invokeContract({
    address: CONTRACT_ADDR,
    functionName: "registerCharacterHash",
    inputs: { committedHash: h },
  });

  const txHash = await connector.submitTx(tx);
  console.log(`✅ registered commitment ${h} → tx ${txHash}`);
  return { hash: h, txHash };
} 