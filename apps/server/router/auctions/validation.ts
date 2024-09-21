import dayjs from "dayjs";
import { z } from "zod";

export const createAuctionValidation = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(1200),
  reservePrice: z.coerce.number().min(1),
  endTime: z.coerce.date().min(dayjs().add(7, 'day').toDate()).max(dayjs().add(14, 'day').toDate()),
  bidIncrement: z.coerce.number().min(1),
  assets: z.object({id: z.number(), url: z.string(), width: z.number(), height: z.number(), createdAt: z.coerce.date()}).array().min(1).max(12),
  currency: z.enum(['usd', 'azn']),
  categoryId: z.number().nullish()
})

export const createAuctionAndRegisterValidation = createAuctionValidation.extend({
  name: z.string().min(1),
  phone: z.string().min(1),
  password: z.string().min(1)
})

export type CreateAuctionAndRegisterValidation =  z.infer<typeof createAuctionAndRegisterValidation>
export type CreateAuctionValidation = z.infer<typeof createAuctionValidation>
