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

### Run the Midnight dev-net via Docker

If you would rather avoid installing the Midnight CLI natively you can spin-up a single-node dev-net (node + proof-server) as a Docker container instead:

```bash
# pulls the latest public image & runs it in the background
#   ‑ container name matches what the helper scripts expect ("midnight-dev")
#   ‑ ports 8090 (RPC) and 6300 (proof-server) are forwarded to the host
#   ‑ remove --detach (-d) if you want to tail the logs in the foreground

docker run -d --name midnight-dev -p 8090:8090 -p 6300:6300 midnightnetwork/devnet:latest
```

Once the container is healthy you can continue with the normal workflow (build → deploy → prove) from another terminal:

```bash
pnpm contracts:deploy             # compiles & deploys contracts to the containerised chain
pnpm dapp:prove-topic Cardano ./examples/character.json
```

To stop and remove the local chain just run `docker rm -f midnight-dev`.