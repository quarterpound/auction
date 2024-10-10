import { z } from "zod";
import { prisma } from "../../database";
import { publicProcedure, router } from "../../trpc";
import { addEmailToAudience } from "../../mail";

interface SitemapItem {
    url: string;                // The URL of the page
    lastModified?: string;           // The date of the last modification in ISO 8601 format. Optional
    changefreq?: ChangeFreq;    // How frequently the page is likely to change. Optional
    priority?: number;          // The priority of this URL relative to other URLs on your site. Optional, usually between 0 and 1
}

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';


export const generalRouter = router({
  sitemap: publicProcedure.output(
    z.object({
      url: z.string(),
      lastModified: z.string().nullish(),
    }).array()
  ).query(async () => {
    const [posts, category] = await prisma.$transaction([
      prisma.post.findMany({
        select: {
          slug: true,
          createdAt: true,
          category: {
            select: {
              slug: true,
              parent: {
                select: {
                  slug: true,
                }
              }
            }
          }
        }
      }),
      prisma.category.findMany({
        select: {
          slug: true,
          parent: {
            select: {
              slug: true,
            }
          },
          post:{
            take: 1,
            orderBy: {
              createdAt: 'desc'
            },
            select: {
              createdAt: true,
            }
          }
        }
      })
    ])

    const postsParsed: SitemapItem[] = posts.map(item => ({
      url: `/auctions/${item.category?.parent?.slug}/${item.category?.slug}/${item.slug}`,
      lastModified: item.createdAt.toISOString()
    }))

    const categoryParsed: SitemapItem[] = category.map(item => {
      if(item.parent) {
        return ({
          url: `/auctions/${item.parent.slug}/${item.slug}`,
          lastModified: item.post[0]?.createdAt.toISOString()
        })
      }

      return ({
        url: `/auctions/${item.slug}`,
        lastModified: item.post[0]?.createdAt.toISOString()
      })
    })

    return [...postsParsed, ...categoryParsed]
  }),
  signUpToNewsletter: publicProcedure.input(z.object({email: z.string().email()})).mutation(async ({input}) => {
    await addEmailToAudience(input.email)
    return input.email
  })
})
