import { trpcVanillaClient } from "@/trpc"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Feed from "@/components/molecules/feed"

type PageProps = {params: {parent: string, child: string}}

export const generateMetadata = async ({params: {child}}: PageProps): Promise<Metadata> => {
  const data = await trpcVanillaClient.category.getCategoryMetadata.query({slug: child})

  if(!data) {
    notFound()
  }

  return {
    title: data.name
  }
}

const Page = async ({params: { child}}: PageProps) => {
  const category = await trpcVanillaClient.category.getCategoryMetadata.query({slug: child})

  if(!category) {
    notFound();
  }

  const data = await trpcVanillaClient.feed.all.query({categoryId: category.id})

  return (
    <div className="container mx-auto grid gap-8">
      <h1 className="text-3xl font-bold">{category.name}</h1>
      <Feed initialData={data} categoryId={category.id} />
    </div>
  )
}

export default Page
