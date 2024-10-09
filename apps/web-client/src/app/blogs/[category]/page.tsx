import { notFound } from "next/navigation"
import BlogCard from "../blog-card"
import { getBlogs, getCategory } from'@/lib/content-db'
import Link from "next/link"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

interface SingleBlogProps {
  params: {
    category: string
  }
}

export const generateMetadata = async ({params: {category}}: SingleBlogProps) => {
  const cat = await getCategory(category)

  if(!cat) {
    notFound()
  }

  return {
    title: cat.title,
    description: cat.description
  }
}

const SingleBlog = async ({params: {category}}: SingleBlogProps) => {
  const cat = await getCategory(category)

  if(!cat) {
    notFound()
  }

  const {data} = await getBlogs(category)

  return (
    <div className='container mx-auto grid gap-8'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild={true}>
              <Link href={'/blogs'}>Bütün xəbərlər</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{cat.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-bold">{cat.title}</h1>
      <div className='grid lg:grid-cols-3 gap-4'>
        {
          data.map(item => (
            <BlogCard key={item.id} item={item} />
          ))
        }
      </div>
    </div>
  )
}

export default SingleBlog
