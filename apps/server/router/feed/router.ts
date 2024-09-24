import { Prisma } from "@prisma/client";
import { prisma } from "../../database";
import { publicProcedure, router } from "../../trpc";
import { AuctionFeedItem, feedResultValidation, feedValidation } from "./validation";

export const feedRouter = router({
  all: publicProcedure.input(feedValidation).output(feedResultValidation).query(async ({input}) => {

    try {
      let orderBy = 'p."createdAt" DESC'

      if(input.orderBy === 'lowest-price') {
        orderBy = 'lb.amount ASC'
      }

      if(input.orderBy === 'highest-price') {
        orderBy = 'lb.amount DESC'
      }

      if(input.orderBy === 'ending-soonest') {
        orderBy = 'p.end_time ASC'
      }

      if(input.orderBy === 'ending-earliest') {
        orderBy = 'p.end_time DESC'
      }

      const data = await prisma.$queryRawUnsafe<AuctionFeedItem[]>(`
        SELECT
            p.*,
            CAST(COALESCE(lb.amount, p.price_min) AS INTEGER) AS amount,
            CAST(COALESCE(bc.bid_count, 0) AS INTEGER) AS bid_count,
            COALESCE(a.assets, '[]') AS assets  -- Aggregated assets as JSON array
        FROM
            posts p
        LEFT JOIN (
            SELECT
                b.post_id,
                b.amount,
                ROW_NUMBER() OVER (
                    PARTITION BY b.post_id
                    ORDER BY b.created_at DESC
                ) AS rn
            FROM
                bids b
        ) lb ON p.id = lb.post_id AND lb.rn = 1
        LEFT JOIN (
            SELECT
                b.post_id,
                COUNT(*) AS bid_count
            FROM
                bids b
            GROUP BY
                b.post_id
        ) bc ON p.id = bc.post_id
        LEFT JOIN (
            SELECT
                aop.post_id,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', a.id,
                        'url', a.url,
                        'width', a.width,
                        'height', a.height,
                        'created_at', a."createdAt"
                    )
                ) AS assets
            FROM
                assets_on_posts aop
            JOIN
                assets a ON aop.asset_id = a.id
            GROUP BY
                aop.post_id
        ) a ON p.id = a.post_id
        WHERE
            p.end_time > NOW()
            ${input.categoryId ? `AND p.category_id = ${input.categoryId}` : ''}
        ORDER BY
            ${orderBy} NULLS LAST
        LIMIT 25
        OFFSET ${input.cursor * 25};
      `)

      return {
        nextCursor: input.cursor + 1,
        data: data,
      };
    } catch(e) {
      console.log(e)
      throw e;
    }
  })
})
