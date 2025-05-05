import { execSync } from "child_process";
import path from "path";

function run(cmd: string) {
  console.log("$", cmd);
  execSync(cmd, { stdio: "inherit" });
}

// Simple deploy helper – assumes Midnight CLI installed & devnet running
export function deploy() {
  const contractDir = path.resolve(__dirname, "..", "src", "CharacterProof.compact.ts");
  run(`midnight compact build ${contractDir}`);

  // The CLI outputs a .contract file we can deploy
  // This is a placeholder; adapt to match real CLI once available
  run(`midnight contract deploy ./build/CharacterProof.contract --devnet`);
}

if (require.main === module) {
  deploy();
} 