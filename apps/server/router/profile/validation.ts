import { z } from "zod";

export const profileUpdateValidation = z.object({
  name: z.string().min(1),
  email: z.string().email().nullish(),
  password: z.string().min(1).nullish(),
  phone: z.string().min(1)
})

export type ProfileUpdateValidation = z.infer<typeof profileUpdateValidation>
