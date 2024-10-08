import dayjs from "dayjs";
import { z } from "zod";
import sanitizeHtml from 'sanitize-html';

export const createAuctionValidation = z.object({
  title: z.string().transform(f => f.trim().toLowerCase()).pipe(z.string().min(1)),
  description: z.string().min(1).max(1200).transform(f => sanitizeHtml(f)),
  reservePrice: z.coerce.number().min(1),
  endTime: z.coerce.date().min(dayjs().add(7, 'day').toDate()).max(dayjs().add(14, 'day').toDate()),
  bidIncrement: z.coerce.number().min(1),
  assets: z.object({id: z.string(), url: z.string(), smallUrl: z.string(), name: z.string(), smallWidth: z.number(), smallHeight: z.number(), width: z.number(), height: z.number(), createdAt: z.coerce.date()}).array().min(1).max(12),
  currency: z.enum(['usd', 'azn']),
  categoryId: z.string().uuid()
})

export const createAuctionAndRegisterValidation = createAuctionValidation.extend({
  name: z.string().transform(f => f.trim().toLowerCase()).pipe(z.string().min(5)),
  email: z.string().email().transform(f => f.trim().toLowerCase()),
  password: z.string().min(1)
})

export type CreateAuctionAndRegisterValidation =  z.infer<typeof createAuctionAndRegisterValidation>
export type CreateAuctionValidation = z.infer<typeof createAuctionValidation>
