import { z } from "zod";
import { prisma } from "../../database";
import { publicProcedure, router } from "../../trpc";
import { addEmailToAudience } from "../../mail";
import { TRPCError } from "@trpc/server";

interface SitemapItem {
    url: string;                // The URL of the page
    lastmod?: string;           // The date of the last modification in ISO 8601 format. Optional
    changefreq?: ChangeFreq;    // How frequently the page is likely to change. Optional
    priority?: number;          // The priority of this URL relative to other URLs on your site. Optional, usually between 0 and 1
}

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';


export const generalRouter = router({
  sitemap: publicProcedure.query(async () => {
    const [posts, category] = await prisma.$transaction([
      prisma.post.findMany({
        select: {
          slug: true,
          createdAt: true,
        }
      }),
      prisma.category.findMany({
        select: {
          slug: true,
          children: {
            select: {
              slug: true,
            }
          }
        }
      })
    ])

    return []
  }),
  signUpToNewsletter: publicProcedure.input(z.object({email: z.string().email()})).mutation(async ({input}) => {
    const data = await addEmailToAudience(input.email)

    return input.email
  })
})
