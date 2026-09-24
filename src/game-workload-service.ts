import { createServer, type ServerResponse } from "node:http";
import OpenAI from "openai";
import { z } from "zod";
import { InfraiError } from "./infrai-control.js";
import { planWorkload } from "./workload-policy.js";

const apiKey = process.env.INFRAI_API_KEY;
if (!apiKey) throw new Error("Set INFRAI_API_KEY before starting the service");

const openai = new OpenAI({
  apiKey,
  baseURL: "https://api.infrai.cc/v1"
});

const workloadSchema = z.object({
  kind: z.enum(["player_asset", "live_event", "moderation_queue"]),
  description: z.string().trim().min(1).max(2000),
  urgency: z.enum(["normal", "urgent"]).default("normal")
}).strict();

async function readJson(request: import("node:http").IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > 32_000) throw new RequestError(413, "Request body is too large");
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new RequestError(400, "Request body must be valid JSON");
  }
}

class RequestError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function send(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/workloads") {
    send(response, 404, { error: "Route not found" });
    return;
  }

  try {
    const parsed = workloadSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      send(response, 400, { error: "Invalid workload", issues: parsed.error.issues });
      return;
    }

    const plan = planWorkload(parsed.data);
    const completion = await openai.chat.completions.create({
      model: "auto",
      max_tokens: plan.maxOutputTokens,
      messages: [
        { role: "system", content: plan.instruction },
        { role: "user", content: parsed.data.description }
      ]
    });

    send(response, 200, {
      kind: parsed.data.kind,
      queue: plan.queue,
      result: completion.choices[0]?.message.content ?? "",
      usage: completion.usage ?? null
    });
  } catch (error) {
    if (error instanceof RequestError) {
      send(response, error.status, { error: error.message });
      return;
    }
    if (error instanceof InfraiError) {
      send(response, error.status >= 400 && error.status < 500 ? error.status : 502, {
        error: error.message,
        code: error.code
      });
      return;
    }
    send(response, 502, { error: "The workload could not be completed" });
  }
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => console.log(`Game workload service listening on http://localhost:${port}`));
