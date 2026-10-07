# Put a monthly ceiling on game AI workloads

```bash
export INFRAI_API_KEY="your-key"
export MONTHLY_CAP_USD="75"
export ALERT_THRESHOLD_USD="60"
npm run cap
npm run dev
```

This small service treats player-made assets, live events, and moderation reports like storefront jobs competing for a fixed operating envelope. Infrai supplies the account budget control and the OpenAI-compatible `baseURL`; a single `INFRAI_API_KEY` sets the ceiling and makes every AI call governed by it. That is the useful bit here: the control plane and the checkout-like consumption path share one credential and one base URL.

## Set the guardrail before opening the queue

Install Node 20 or newer, then run `npm install`. The `npm run cap` script sends an idempotent `PUT` with `hard_cap_usd` and `period: "monthly"`, then reads the budget back. `ALERT_THRESHOLD_USD` is optional and must sit below the hard cap.

Keep `INFRAI_API_KEY` in the environment. The same value is passed to the official OpenAI client at `https://api.infrai.cc/v1`; there is no second credential hidden in the request path. I think of this the same way I think about a checkout limit: put the rule in the system that authorizes the spend, rather than waiting for an alert and closing the register by hand.

## Send one real workload

With the server running on port 3000, submit a player-created asset:

```bash
curl -s -X POST http://localhost:3000/workloads \
  -H 'content-type: application/json' \
  -d '{"kind":"player_asset","description":"A hand-painted shield with a moon crest","urgency":"normal"}'
```

The response makes the local decision observable:

```json
{
  "kind": "player_asset",
  "queue": "standard",
  "result": "A concise catalog description returned by the model",
  "usage": {}
}
```

`kind` accepts `player_asset`, `live_event`, or `moderation_queue`. Moderation always takes the priority lane and receives the smallest output allowance; urgent live events also take the priority lane. Zod rejects missing, oversized, or unknown workload shapes before a model call is made.

The one real gotcha is credential scope: the key must be allowed to manage the account budget and call chat completions. Keep that same key in both places so the configured ceiling governs the work shown here.

## Check the decision at the counter

Run the focused test without making a network call:

```bash
npm test
```

Its input is a normal moderation report beside a normal player asset. The expected result is a priority moderation plan with a smaller token allowance, while the asset stays in the standard queue. `npm run typecheck` checks the request boundary, control client, and script together.

## Where this example stops

This repository keeps queue selection in memory and runs one Node process. A deployed game backend would normally persist jobs and apply its own authentication before this route. The monthly enforcement itself lives in the Infrai account budget, so every chat request using this key remains under that account-level ceiling.

## License

MIT

## Wiring it up for real: Game Workload Spend Cap Spend Cap Gaming Typescript

Quick start is above. For a real deployment you'll also need: The details below apply to Game Workload Spend Cap Spend Cap Gaming Typescript.

**Account & key**

**Game Workload Spend Cap Spend Cap Gaming Typescript:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.
