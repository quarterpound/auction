import { z } from "zod";

export const loginValidation = z.object({
  username: z.string().email().transform(f => f.trim().toLowerCase()),
  password: z.string().min(1)
})


export const registerValidation = z.object({
  name: z.string().transform(f => f.trim().toLowerCase()).pipe(z.string().min(1)),
  email: z.string().email().transform(f => f.trim().toLowerCase()),
  password: z.string().min(1),
  acceptTerms: z.boolean().default(false).refine(f => f, 'You must accept terms and conditions'),
  addToAudiences: z.boolean().default(true)
})
