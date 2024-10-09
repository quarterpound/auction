import { trpcVanillaClient } from "@/trpc";
import { MetadataRoute } from "next";
import { getBlogs, getCategories } from "@/lib/content-db";
import { getFaqItems } from "@/lib/content-db";

export const dynamic = 'force-dynamic'

const STATIC_PAGES = [
  'login',
  'register',
  'blogs',
  'faq'
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await trpcVanillaClient.general.sitemap.query()
  const blogs = await getBlogs(null, null, 0, 1200)
  const faqs = await getFaqItems();
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


  const faqSitemap = faqs.map(item => ({
    url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/faq/${item.slug}`,
  }))

  const staticSitemap = STATIC_PAGES.map(item => ({
    url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/${item}`,
  }))


  return [
    ...staticSitemap,
    ...rest,
    ...blogCatSitemap,
    ...blogSitemap,
    ...faqSitemap,
  ]
}
