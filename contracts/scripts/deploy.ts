// @ts-nocheck
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { deployContract, waitForTx } from "@midnight-ntwrk/midnight-js-contracts";
import { TESTNET_ID } from "@midnight-ntwrk/midnight-js-network-id";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";

function run(cmd: string, capture = false): string | undefined {
  console.log("$", cmd);
  const buf = execSync(cmd, { stdio: capture ? "pipe" : "inherit" });
  return capture ? buf.toString() : undefined;
}

// Find a binary on host or via docker exec
function ensureBinary(bin: string, containerBin = bin): string {
  try {
    execSync(`which ${bin}`, { stdio: "pipe" });
    return bin; // found on host PATH
  } catch {
    /* not on host */
  }

  // Fallback into the docker proof-server
  try {
    execSync("docker ps --format '{{.Names}}' | grep -q '^midnight-dev$'");
    return `docker exec midnight-dev ${containerBin}`;
  } catch {
    /* container not running */
  }

  return ""; // not found
}

function ensureCompactc(): string {
  const cmd = ensureBinary("compactc");
  if (cmd) return cmd;
  console.error("❌  compactc not found in PATH or inside 'midnight-dev' container. Install compiler v0.22+ first.");
  process.exit(1);
}

// Simple deploy helper – assumes Midnight CLI installed & devnet running
export async function deploy() {
  const rootDir = path.resolve(__dirname, "..", "..");
  const srcDir = path.resolve(__dirname, "..", "src");
  const buildDir = path.resolve(__dirname, "..", "build");

  const COMPILE = ensureCompactc();

  // Ensure build dir exists
  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });

  // 1. (Re)compile all Compact sources → .zkir files
  for (const file of fs.readdirSync(srcDir)) {
    if (!file.endsWith(".compact")) continue;
    const srcPath = path.join(srcDir, file);
    // compactc 0.22 only needs the source + output dir (flags must precede path but we pass none)
    run(`${COMPILE} ${srcPath} ${buildDir}`);
  }

  // 2. Deploy every compiled artefact via JS SDK
  const proofUrl = process.env.PROOF_URL ?? "http://localhost:6300";
  const proofProvider = httpClientProofProvider(proofUrl);

  const addresses: Record<string, string> = {};

  // compactc writes .zkir files into a "zkir" subfolder inside the output dir
  const artefactsDir = path.join(buildDir, "zkir");
  if (!fs.existsSync(artefactsDir)) {
    console.warn(`⚠️  No .zkir artefacts found at ${artefactsDir}`);
  }

  for (const file of (fs.existsSync(artefactsDir) ? fs.readdirSync(artefactsDir) : [])) {
    if (!file.endsWith(".zkir")) continue;

    const zkirPath = path.join(artefactsDir, file);
    const name = path.basename(file, ".zkir");

    try {
      const { stdout } = run(
        `midnight-cli deploy-contract ${zkirPath} --json`,
        /* capture */ true
      )!;
      const { contractAddress, txHash } = JSON.parse(stdout);
      console.log(`→ ${name} deployed  tx ${txHash}  addr ${contractAddress}`);
      addresses[name] = contractAddress;
    } catch (err) {
      console.error(`✖ failed to deploy ${name}:`, err);
    }
  }

  // 3. Persist mapping for dapp consumption
  const deploymentsDir = path.join(rootDir, "contracts", "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  const outFile = path.join(deploymentsDir, "devnet.json");
  fs.writeFileSync(outFile, JSON.stringify(addresses, null, 2));
  console.log(`📦  wrote ${outFile}`);
}

if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  deploy();
} 