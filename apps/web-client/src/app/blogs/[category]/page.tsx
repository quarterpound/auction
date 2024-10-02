import { notFound } from "next/navigation"
import BlogCard from "../blog-card"
import { getBlogs, getCategory } from "../db"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
      <div className="flex gap-3 items-center">
        <Link href={'/blogs'}>
          <ArrowLeft />
        </Link>
        <h1 className="text-3xl font-bold">{cat.title}</h1>
      </div>
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
