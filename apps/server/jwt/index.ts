import dayjs from "dayjs"
import { sign, verify } from "hono/jwt"
import { z } from "zod"
import { env } from "../env"
import { TRPCError } from "@trpc/server"

export const signPayload = z.object({
  sub: z.string(),
  name: z.string(),
  emailVerified: z.boolean(),
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
  try {
    return signPayload.parse(payload);
  } catch(e) {
    throw new TRPCError({
      code: 'UNAUTHORIZED'
    })
  }
}
