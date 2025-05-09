// @ts-nocheck
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { ContractRuntime } from "@midnight-ntwrk/midnight-js-contracts";
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

// Helper to load bytecode from either *.bytecode (raw hex) or *.contract (JSON)
function loadBytecode(filePath: string): string {
  if (filePath.endsWith(".bytecode")) {
    const hex = fs.readFileSync(filePath, "utf-8").trim();
    return hex.startsWith("0x") ? hex : `0x${hex}`;
  }
  // assume .contract json structure { "bytecode": "0x..." }
  const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const hex = json.bytecode ?? json.byteCode ?? json.code ?? "";
  if (!hex) throw new Error(`bytecode missing in ${filePath}`);
  return hex.startsWith("0x") ? hex : `0x${hex}`;
}

// Simple deploy helper – assumes Midnight CLI installed & devnet running
export async function deploy() {
  const rootDir = path.resolve(__dirname, "..", "..");
  const srcDir = path.resolve(__dirname, "..", "src");
  const buildDir = path.resolve(__dirname, "..", "build");

  const COMPILE = ensureCompactc();

  // Ensure build dir exists
  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });

  // 1. (Re)compile all Compact sources → .contract files
  for (const file of fs.readdirSync(srcDir)) {
    if (!file.endsWith(".compact")) continue;
    const srcPath = path.join(srcDir, file);
    run(`${COMPILE} ${srcPath} ${buildDir}`);
  }

  // 2. Deploy every compiled artefact via JS SDK
  const runtime = new ContractRuntime({
    networkId: TESTNET_ID,
    proofProvider: httpClientProofProvider({ url: process.env.PROOF_URL ?? "http://localhost:6300" }),
  });

  const addresses: Record<string, string> = {};

  for (const file of fs.readdirSync(buildDir)) {
    if (!(file.endsWith(".bytecode") || file.endsWith(".contract"))) continue;

    const artefactPath = path.join(buildDir, file);
    const name = path.basename(file).replace(/\.(bytecode|contract)$/, "");
    const bytecode = loadBytecode(artefactPath);

    try {
      // eslint-disable-next-line no-await-in-loop
      const { address } = await runtime.deploy({ bytecode });
      addresses[name] = address;
      console.log(`→ ${name} deployed at ${address}`);
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