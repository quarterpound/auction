import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { SingleBlogCardResult } from "./db"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, UserIcon } from "lucide-react"
import dayjs from "dayjs"
import Link from "next/link"

interface BlogCardProps {
  item: SingleBlogCardResult
}

const BlogCard = ({item}: BlogCardProps) => {
  return (
    <Card key={item.id} className="flex flex-col">
      <img
        src={`https://directus.auksiyon.az/assets/${item.featured_image}?width=500&height=200&fit=cover&format=webp&quality=50`}
        alt={item.title}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <CardHeader className="pb-2">
        <Link href={`/blogs/${item.category_slug}/${item.slug}`}>
          <h2 className="text-xl font-semibold">{item.title}</h2>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground mb-4 line-clamp-2">{item.excerpt}</p>
        <Link href={`/blogs/${item.category_slug}`}>
          <Badge>{item.category_title}</Badge>
        </Link>
      </CardContent>
      <CardFooter className="grid md:flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center">
          <UserIcon className="w-4 h-4 mr-1" />
          {item.author_name}
        </div>
        <div className="flex items-center">
          <CalendarIcon className="w-4 h-4 mr-1" />
          {dayjs(item.date_created).format('DD-MM-YYYY HH:mm')}
        </div>
      </CardFooter>
    </Card>
  )
}

export default BlogCard
