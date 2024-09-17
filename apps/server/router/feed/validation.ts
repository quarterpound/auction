import { z } from "zod";

export const feedValidation = z.object({
  cursor: z.number().min(0).default(0),
  orderBy: z.enum(['lowest-price', 'highest-price', 'ending-soonest', 'ending-earliest']).nullish()
})

export const auctionFeedItem = z.object({
  assets: z.array(z.object({
    id: z.number(),
    created_at: z.coerce.date(),
    url: z.string(),
  })),
  amount: z.number(),
  bid_increment: z.number(),
  createdAt: z.date(),
  currency: z.enum(['azn', 'usd']),
  description: z.string(),
  description_html: z.string(),
  end_time: z.date(),
  id: z.number(),
  name: z.string(),
  price_min: z.number(),
  slug: z.string(),
  bid_count: z.coerce.number(),
  updatedAt: z.date()
})

export const feedResultValidation = z.object({
  data: auctionFeedItem.array(),
  nextCursor: z.number(),
})

export type FeedValidation = z.infer<typeof feedValidation>
export type AuctionFeedItem = z.infer<typeof auctionFeedItem>
export type FeedResultValidation = z.infer<typeof feedResultValidation>
