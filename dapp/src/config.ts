import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".env") });

export const RPC = process.env.MIDNIGHT_RPC ?? "http://localhost:8090";
export const CONTRACT_ADDR = process.env.CONTRACT_ADDR ?? ""; // to be set after deploy 