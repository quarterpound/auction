import { trpcVanillaClient } from "@/trpc";
import { MetadataRoute } from "next";

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await trpcVanillaClient.general.sitemap.query()

  return data.map(item => ({
    url: `${process.env.NEXT_PUBLIC_CLIENT_URL}${item.url}`,
    lastModified: item.lastModified ?? undefined
  }))
}
