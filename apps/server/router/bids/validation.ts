import { z } from "zod";


export const createBidValidation = z.object({id: z.number(), amount: z.number().max(10_000)})

export type CreateBidValidation = z.infer<typeof createBidValidation>
