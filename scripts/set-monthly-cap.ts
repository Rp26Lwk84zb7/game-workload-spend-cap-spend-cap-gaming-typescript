import { z } from "zod";
import { InfraiControlClient } from "../src/infrai-control.js";

const envSchema = z.object({
  INFRAI_API_KEY: z.string().min(1),
  MONTHLY_CAP_USD: z.coerce.number().positive(),
  ALERT_THRESHOLD_USD: z.coerce.number().positive().optional()
}).refine(
  (value) => value.ALERT_THRESHOLD_USD === undefined ||
    value.ALERT_THRESHOLD_USD < value.MONTHLY_CAP_USD,
  { message: "ALERT_THRESHOLD_USD must be below MONTHLY_CAP_USD" }
);

const env = envSchema.parse(process.env);
const client = new InfraiControlClient(env.INFRAI_API_KEY);

await client.setMonthlyBudget({
  hard_cap_usd: env.MONTHLY_CAP_USD,
  period: "monthly",
  ...(env.ALERT_THRESHOLD_USD === undefined
    ? {}
    : { alert_threshold_usd: env.ALERT_THRESHOLD_USD })
});

const budget = await client.getBudget();
console.log("Monthly game workload cap is active:", budget);
