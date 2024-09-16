import { z } from "zod";

export const registerValidation = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  phone: z.string().min(1),
  name: z.string(),
  acceptTerms: z.boolean().refine((data) => data === true, {
    message: "You must accept the terms and conditions"
  }),
  addToAudiences: z.boolean().default(false)
})

export type RegisterValidation = z.infer<typeof registerValidation>
