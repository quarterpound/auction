import { Prisma } from "@prisma/client";
import { prisma } from "../../database";
import { publicProcedure, router } from "../../trpc";
import { AuctionFeedItem, feedResultValidation, feedValidation } from "./validation";

export const feedRouter = router({
  all: publicProcedure.input(feedValidation).output(feedResultValidation).query(async ({input}) => {

    try {
      let orderBy = 'p."createdAt" DESC'

      if(input.orderBy === 'lowest-price') {
        orderBy = 'amount ASC'
      }

      if(input.orderBy === 'highest-price') {
        orderBy = 'amount DESC'
      }

      if(input.orderBy === 'ending-soonest') {
        orderBy = 'p.end_time ASC'
      }

      if(input.orderBy === 'ending-latest') {
        orderBy = 'p.end_time DESC'
      }

      console.log(`
        SELECT
            p.*,
            c.slug as category_slug,
            c.name as category_name,
            cp.name as parent_category_name,
            cp.slug as parent_category_slug,
            CAST(COALESCE(lb.amount, p.price_min) AS FLOAT) AS amount,
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
        left join categories c on c.id = p.category_id
        left join categories cp on cp.id = c.category_id
        WHERE
            p.end_time > NOW()
            AND p.pending = false
            ${input.categoryId ? `AND p.category_id = '${input.categoryId}'` : ''}
        ORDER BY
            ${orderBy} NULLS LAST
        LIMIT ${input.max}
        OFFSET ${input.cursor * input.max};
      `)

      const data = await prisma.$queryRawUnsafe<AuctionFeedItem[]>(`
        SELECT
            p.*,
            c.slug as category_slug,
            c.name as category_name,
            cp.name as parent_category_name,
            cp.slug as parent_category_slug,
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
        left join categories c on c.id = p.category_id
        left join categories cp on cp.id = c.category_id
        WHERE
            p.end_time > NOW()
            AND p.pending = false
            ${input.categoryId ? `AND p.category_id = '${input.categoryId}'` : ''}
        ORDER BY
            ${orderBy} NULLS LAST
        LIMIT ${input.max + 1}
        OFFSET ${input.cursor * input.max};
      `)

      return {
        nextCursor: data.length > input.max ? input.cursor + 1 : null,
        data: data.slice(0, input.max),
      };
    } catch(e) {
      console.log(e)
      throw e;
    }
  })
})
