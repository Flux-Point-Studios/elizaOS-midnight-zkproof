// @ts-nocheck
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".env") });

export const RPC = process.env.MIDNIGHT_RPC ?? "http://localhost:8090";

// Attempt to load devnet deployment addresses written by contracts/scripts/deploy.ts
let deployedAddress = "";
try {
  const jsonPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../contracts/deployments/devnet.json");
  if (fs.existsSync(jsonPath)) {
    const deployments = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    deployedAddress = deployments.CharacterRegistry ?? deployments.characterregistry ?? "";
  }
} catch {
  /* ignore */
}

export const CONTRACT_ADDR = process.env.CONTRACT_ADDR ?? deployedAddress; 