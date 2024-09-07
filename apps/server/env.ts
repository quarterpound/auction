import { z } from 'zod';

const parser = z.object({
  SERVER_PORT: z.coerce.number().default(4200),
})

export const env = parser.parse(Bun.env)
