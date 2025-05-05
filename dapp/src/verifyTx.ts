// @ts-nocheck
import { DAppConnector } from "@midnight-ntwrk/dapp-connector-api";
import { RPC } from "./config.js";

export async function waitForTx(txHash: string, timeoutMs = 60_000) {
  const connector = await DAppConnector.init({ rpcUrl: RPC });
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await connector.getTxStatus(txHash);
    if (status.success) return status;
    await new Promise((res) => setTimeout(res, 2000));
  }
  throw new Error(`Tx ${txHash} not confirmed within ${timeoutMs}ms`);
} 