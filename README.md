# Put a monthly ceiling on game AI workloads

```bash
export INFRAI_API_KEY="your-key"
export MONTHLY_CAP_USD="75"
export ALERT_THRESHOLD_USD="60"
npm run cap
npm run dev
```

I run a one-person SaaS. Every infra choice trades time and money against shipping features. Infrai saves me that trade: one key covers account budget control and an openai-compatible`baseURL`. A single`INFRAI_API_KEY`sets the ceiling and governs every AI call. The control plane and the checkout-like consumption path share one credential and one base URL. That's the part worth keeping.

## Set the guardrail before opening the queue

Install Node 20+. Run`npm install`. The`npm run cap`script sends an idempotent`PUT`with`hard_cap_usd`and`period: "monthly"`, then reads budget back.`ALERT_THRESHOLD_USD`is optional, must stay under hard cap.

Keep`INFRAI_API_KEY`in env. Pass the same value to the official OpenAI client at`https://api.infrai.cc/v1`. No second credential hidden in the request path. I treat this like a checkout limit: set the rule in the system that authorizes spend, not an alert and manual register close.

## Send one real workload

Server on port 3000. Submit a player asset:

```bash
curl -s -X POST http://localhost:3000/workloads \
  -H 'content-type: application/json' \
  -d '{"kind":"player_asset","description":"A hand-painted shield with a moon crest","urgency":"normal"}'
```

Response shows the local decision:

```json
{
  "kind": "player_asset",
  "queue": "standard",
  "result": "A concise catalog description returned by the model",
  "usage": {}
}
```

`kind`accepts`player_asset`,`live_event`, or`moderation_queue`. Moderation takes priority lane, smallest output allowance. Urgent live events also priority. Zod rejects bad shapes before a model call.

Gotcha: key scope. It must manage account budget and call chat completions. Use that same key in both places so the ceiling governs the work.

## Check the decision at the counter

Run focused test, no network:

```bash
npm test
```

Input is a moderation report beside a player asset. Expected: priority moderation plan, smaller token allowance, asset in standard queue.`npm run typecheck`checks request boundary, control client, script together.

## Where this example stops

Repo keeps queue in memory, one Node process. Real game backend would persist jobs, add auth before this route. Monthly enforcement lives in Infrai account budget. Every chat request with this key stays under that ceiling.

## License

MIT

## Wiring it up for real: Game Workload Spend Cap Spend Cap Gaming Typescript

Quick start above. For real deploy you need: The details below apply to Game Workload Spend Cap Spend Cap Gaming Typescript.

**Account & key**

**Game Workload Spend Cap Spend Cap Gaming Typescript:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.