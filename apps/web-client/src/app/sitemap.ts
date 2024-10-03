import { trpcVanillaClient } from "@/trpc";
import { MetadataRoute } from "next";
import { getBlogs, getCategories } from "./blogs/db";

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await trpcVanillaClient.general.sitemap.query()
  const blogs = await getBlogs(null, null, 0, 1200)
  const categories = await getCategories()



  const rest = data.map(item => ({
    url: `${process.env.NEXT_PUBLIC_CLIENT_URL}${item.url}`,
    lastModified: item.lastModified ?? undefined
  }))

  const blogSitemap = blogs.data.map(item => ({
    url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/blogs/${item.category_slug}/${item.slug}`,
    lastModified: item.date_created.toISOString()
  }))

  const blogCatSitemap = categories.map(item => ({
    url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/blogs/${item.slug}`,
  }))

  console.log(blogCatSitemap)

  return [
    ...rest,
    ...blogCatSitemap,
    ...blogSitemap
  ]
}
