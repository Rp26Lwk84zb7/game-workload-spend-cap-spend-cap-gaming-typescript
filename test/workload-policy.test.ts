import assert from "node:assert/strict";
import test from "node:test";
import { planWorkload } from "../src/workload-policy.js";

test("moderation work stays ahead of a normal player asset", () => {
  const moderation = planWorkload({
    kind: "moderation_queue",
    description: "Review a reported guild name",
    urgency: "normal"
  });
  const asset = planWorkload({
    kind: "player_asset",
    description: "Describe a player-designed banner",
    urgency: "normal"
  });

  assert.equal(moderation.queue, "priority");
  assert.equal(asset.queue, "standard");
  assert.ok(moderation.maxOutputTokens < asset.maxOutputTokens);
});
