import { z } from "zod";

const parser = z.object({
  TRPC_URL: z.string(),
  WS_URL: z.string(),
})

export const env = parser.parse(process.env)
