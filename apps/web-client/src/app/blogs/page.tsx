import { getBlogs } from './db'
import BlogCard from './blog-card'

export const metadata = {
  title: 'Blogs'
}

export const dynamic = 'force-dynamic'

const BlogsPage = async () => {
  const {data} = await getBlogs()

  return (
    <div className='container mx-auto grid gap-8'>
      <h1 className="text-3xl font-bold">Blogs</h1>
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {
          data.map(item => (
            <BlogCard key={item.id} item={item} />
          ))
        }
      </div>
    </div>
  )
}

export default BlogsPage
