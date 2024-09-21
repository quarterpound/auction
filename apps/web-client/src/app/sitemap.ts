import { env } from "@/env";
import { trpcVanillaClient } from "@/trpc";
import { MetadataRoute } from "next";

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await trpcVanillaClient.general.sitemap.query()

  return data.map(item => ({
    url: `${env.CLIENT_URL}${item.url}`,
    lastModified: item.lastModified ?? undefined
  }))
}
