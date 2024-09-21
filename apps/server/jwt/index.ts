import dayjs from "dayjs"
import { sign, verify } from "hono/jwt"
import { z } from "zod"
import { env } from "../env"

export const signPayload = z.object({
  sub: z.string(),
  name: z.string(),
})

export type SignPayload = z.infer<typeof signPayload>

export const signInternal = (payload: SignPayload): Promise<string> => {
  return sign({
    ...payload,
    exp: Math.floor(dayjs().add(7, 'days').toDate().getTime() / 1000),
  }, env.JWT_SECRET)
}

export const verifyInternal = async (s: string): Promise<SignPayload> => {
  const payload = await verify(s, env.JWT_SECRET);
  return signPayload.parse(payload);
}
