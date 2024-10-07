import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ClockIcon } from "lucide-react"
import { getBlogs, getSingleBlogPost } from "../../db"
import { notFound } from "next/navigation"
import dayjs from "dayjs"
import Link from "next/link"
import BlogCard from "../../blog-card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Metadata } from "next"
import { Separator } from "@/components/ui/separator"

interface BlogPostProps {
  params: {
    slug: string
    category: string
  }
}

export const generateMetadata = async ({params: {slug, category}}: BlogPostProps): Promise<Metadata> => {
  const post = await getSingleBlogPost(slug)


  if(!post) {
    notFound()
  }

  return {
    title: post.title,
    description: post.excerpt.slice(0, 250),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_CLIENT_URL}/blogs/${category}/${slug}`
    },
    authors: [
      {
        name: post.author_name,
      }
    ],
    publisher: "Auksiyon.az"
  }
}

function readingTime(text: string) {
  const wpm = 100;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wpm);
}

const BlogPost = async ({params: {slug}}: BlogPostProps) => {

  const post = await getSingleBlogPost(slug)

  if(!post) {
    notFound()
  }

  const readMore = await getBlogs(post.category_slug, post.slug, 0, 3)

  return (
    <div className="container grid gap-8 mx-auto py-8 max-w-3xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild={true}>
              <Link href={'/blogs'}>Bütün xəbərlər</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild={true}>
              <Link href={`/blogs/${post.category_slug}`}>{post.category_title}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{post.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <article>
        <img
          src={`https://directus.auksiyon.az/assets/${post.featured_image}?width=550&height=350&fit=cover&format=webp&quality=75`}
          alt={post.title}
          className="w-full h-64 object-cover rounded-lg mb-8"
        />
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={`https://directus.auksiyon.az/assets/${post.author_avatar}`}
            alt={post.author_name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">{post.author_name}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span>{dayjs(post.date_created).format('DD-MM-YYYY HH:mm')}</span>
              <ClockIcon className="w-4 h-4 ml-4 mr-1" />
              <span>{`${readingTime(post.content)} minutes`}</span>
            </div>
          </div>
        </div>
        <Link href={`/blogs/${post.category_slug}`}>
          <Badge className="mb-8">{post.category_title}</Badge>
        </Link>
        <div className="grid gap-6">
          <p className="prose prose-lg prose-p:text-muted-foreground">
            {post.excerpt}
          </p>
          <Separator />
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
      {
        readMore.data.length !== 0 && (
          <>
            <hr />
            <div className="grid gap-8">
              <h2 className="text-2xl font-semibold">Read more</h2>
              <div className="grid lg:grid-cols-2 gap-4">
                {
                  readMore.data.map(item => (
                    <BlogCard key={item.id} item={item} />
                  ))
                }
              </div>
            </div>
          </>
        )
      }
    </div>
  )
}

export default BlogPost
