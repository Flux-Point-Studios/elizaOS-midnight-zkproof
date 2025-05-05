// @ts-nocheck
import { spawn } from "child_process";
import path from "path";
import { waitForTx } from "../src/verifyTx.js";
import { proveTopic } from "../src/generateTopicProof.js";
import { deploy } from "../../contracts/scripts/deploy.js";
import { CONTRACT_ADDR } from "../src/config.js";
import fs from "fs";

describe("E2E proof flow", () => {
  jest.setTimeout(180_000);

  let devnet: any;

  beforeAll((done) => {
    // Launch devnet in background
    devnet = spawn("midnight", ["devnet", "up"], { stdio: "inherit" });
    // wait 10s for node to boot
    setTimeout(done, 10000);
  });

  afterAll(() => {
    devnet.kill();
  });

  it("proves topic inclusion", async () => {
    // Deploy contract
    deploy();

    // Copy sample character fixture
    const charPath = path.resolve(__dirname, "../fixtures/example.character.json");
    if (!fs.existsSync(charPath)) throw new Error("fixture missing");

    const txHash = await proveTopic(charPath, "Cardano");
    const status = await waitForTx(txHash, 120_000);
    expect(status.success).toBe(true);
  });
}); 