import { z } from "zod";


export const createBidValidation = z.object({id: z.string(), amount: z.coerce.number().max(100_000_000)})

export type CreateBidValidation = z.infer<typeof createBidValidation>
