import { z } from 'zod';

const parser = z.object({
  SERVER_PORT: z.coerce.number().default(4200),
  JWT_SECRET: z.string(),
  LOOPS_API_KEY: z.string(),
  CLIENT_URL: z.string()
})

export const env = parser.parse(Bun.env)
