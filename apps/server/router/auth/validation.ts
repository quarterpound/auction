import { z } from "zod";

export const loginValidation = z.object({
  username: z.string().email(),
  password: z.string().min(1)
})


export const registerValidation = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  acceptTerms: z.boolean().default(false).refine(f => f, 'You must accept terms and conditions'),
  addToAudiences: z.boolean().default(true)
})
