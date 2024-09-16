import { z } from "zod";

export const loginValidation = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

export type LoginValidation = z.infer<typeof loginValidation>
