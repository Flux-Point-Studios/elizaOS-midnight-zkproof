# ElizaOS Character ZK Proofs on Midnight

This repository provides a reference implementation for generating **zero-knowledge proofs** about private `character.json` files used by ElizaOS agents, and verifying those proofs on **Midnight** – Cardano's privacy-first partner chain.

The codebase is organised as a **pnpm monorepo** with two main packages:

| Package     | Description |
|-------------|-------------|
| `contracts` | Compact smart contracts that run _as ZK circuits_ on Midnight and prove inclusion / exclusion facts about a character file. |
| `dapp`      | A TypeScript CLI & SDK that loads the character file, generates proofs locally, and submits them to the deployed contract. |

Follow the quick-start in `PLAN.md` or the full instructions in `docs/architecture.md` to spin up a local dev-net, deploy the contract, and prove things like:

```bash
pnpm dapp:prove-topic Cardano ./examples/character.json
```