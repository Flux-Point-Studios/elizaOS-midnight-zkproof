import { contains } from "../src/lib/contains";

describe("contains helper", () => {
  it("detects topic", () => {
    expect(contains(["Cardano", "AI"], "Cardano")).toBe(true);
    expect(contains(["Cardano", "AI"], "Solana")).toBe(false);
  });
}); 