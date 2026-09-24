export type GameWorkload = {
  kind: "player_asset" | "live_event" | "moderation_queue";
  description: string;
  urgency: "normal" | "urgent";
};

export type WorkloadPlan = {
  queue: "standard" | "priority";
  maxOutputTokens: number;
  instruction: string;
};

export function planWorkload(workload: GameWorkload): WorkloadPlan {
  if (workload.kind === "moderation_queue") {
    return {
      queue: "priority",
      maxOutputTokens: 180,
      instruction: "Classify the report for a game moderator. Return a short decision and reason."
    };
  }

  if (workload.kind === "live_event" && workload.urgency === "urgent") {
    return {
      queue: "priority",
      maxOutputTokens: 260,
      instruction: "Draft a concise in-game live event update for players."
    };
  }

  return {
    queue: "standard",
    maxOutputTokens: workload.kind === "player_asset" ? 220 : 260,
    instruction: workload.kind === "player_asset"
      ? "Write a compact, safe catalog description for this player-created game asset."
      : "Draft a concise in-game live event update for players."
  };
}
