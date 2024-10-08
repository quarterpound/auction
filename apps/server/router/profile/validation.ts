import { z } from "zod";

export const profileUpdateValidation = z.object({
  name: z.string().min(1),
  email: z.string().email().nullish(),
  password: z.string().min(1).nullish().transform(f => f === '' ? null : f),
  phone: z.string().nullish().transform(f => f === '' ? null : f)
})

export type ProfileUpdateValidation = z.infer<typeof profileUpdateValidation>
