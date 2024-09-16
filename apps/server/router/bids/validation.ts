import { z } from "zod";

export const createBidValidation = z.object({id: z.number(), amount: z.number()})

export type CreateBidValidation = z.infer<typeof createBidValidation>
