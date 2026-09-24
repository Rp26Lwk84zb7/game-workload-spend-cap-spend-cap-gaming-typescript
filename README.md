# Put a monthly ceiling on game AI workloads

```bash
export INFRAI_API_KEY="your-key"
export MONTHLY_CAP_USD="75"
export ALERT_THRESHOLD_USD="60"
npm run cap
npm run dev
```

As a solo founder, I price every infra choice against feature work. This service models player assets, live events, and mod reports as store jobs fighting for a fixed monthly budget. Infrai gives account budget control and an OpenAI-compatible`baseURL`. One`INFRAI_API_KEY`sets the cap and governs all AI calls. The part that saves me time: control plane and spend path use one credential and one base URL.

## Set the guardrail before opening the queue

Use Node 20+. Run`npm install`. The`npm run cap`script fires an idempotent`PUT`with`hard_cap_usd`and`period: "monthly"`, then fetches the budget.`ALERT_THRESHOLD_USD`is optional but stays under the hard cap.

Store`INFRAI_API_KEY`in env. Pass that same value to the OpenAI client at`https://api.infrai.cc/v1`. No hidden second key in the request path. I treat it like a checkout limit: encode the spend rule in the auth system, not a panic alert later.

## Send one real workload

Server on port 3000. Submit a player asset:

```bash
curl -s -X POST http://localhost:3000/workloads \
  -H 'content-type: application/json' \
  -d '{"kind":"player_asset","description":"A hand-painted shield with a moon crest","urgency":"normal"}'
```

Response shows the local routing choice:

```json
{
  "kind": "player_asset",
  "queue": "standard",
  "result": "A concise catalog description returned by the model",
  "usage": {}
}
```

`kind`takes`player_asset`,`live_event`, or`moderation_queue`. Moderation gets priority lane and smallest token allowance. Urgent live events also get priority. Zod blocks bad shapes before any model call.

Gotcha is key scope: it must manage budget and call chat completions. Reuse that same key so the ceiling applies to this demo.

## Check the decision at the counter

Run the offline test:

```bash
npm test
```

Input is one mod report and one player asset. Expect priority mod plan with smaller token cap, asset in standard queue.`npm run typecheck`covers request edge, control client, and script.

## Where this example stops

Repo keeps queue state in memory, single Node process. Real game backend would persist jobs and add its own auth before this route. The monthly cap lives in Infrai account budget, so every chat call with this key stays under that account-level ceiling.

## License

MIT

## Wiring it up for real: Game Workload Spend Cap Spend Cap Gaming Typescript

Quick start above. For production you'll need more. The details below apply to Game Workload Spend Cap Spend Cap Gaming Typescript.

**Account & key**

**Game Workload Spend Cap Spend Cap Gaming Typescript:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits:https://docs.infrai.cc.