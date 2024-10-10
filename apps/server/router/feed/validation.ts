import { heapSize } from "bun:jsc";
import { z } from "zod";

export const feedValidation = z.object({
  cursor: z.number().min(0).default(0),
  max: z.number().max(20).default(9),
  categoryId: z.string().nullish(),
  orderBy: z.enum(['lowest-price', 'highest-price', 'ending-soonest', 'ending-latest']).nullish()
})

export const auctionFeedItem = z.object({
  assets: z.array(z.object({
    id: z.string(),
    created_at: z.coerce.date(),
    width: z.number(),
    height: z.number(),
    url: z.string(),
  })),
  amount: z.number(),
  bid_increment: z.number(),
  createdAt: z.date(),
  currency: z.enum(['azn', 'usd']),
  description: z.string(),
  description_html: z.string(),
  end_time: z.date(),
  id: z.string(),
  name: z.string(),
  price_min: z.number(),
  slug: z.string(),
  bid_count: z.coerce.number(),
  updatedAt: z.date(),
  category_slug: z.string(),
  category_name: z.string(),
  parent_category_name: z.string(),
  parent_category_slug: z.string()
})

export const feedResultValidation = z.object({
  data: auctionFeedItem.array(),
  nextCursor: z.number().nullable(),
})

export type FeedValidation = z.infer<typeof feedValidation>
export type AuctionFeedItem = z.infer<typeof auctionFeedItem>
export type FeedResultValidation = z.infer<typeof feedResultValidation>
