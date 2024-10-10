import { trpcVanillaClient } from "@/trpc"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Feed from "@/components/molecules/feed"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import Link from "next/link"

type PageProps = {params: {parent: string, child: string}}

export const generateMetadata = async ({params: {child}}: PageProps): Promise<Metadata> => {
  const data = await trpcVanillaClient.category.getCategoryMetadata.query({slug: child})

  if(!data) {
    notFound()
  }

  return {
    title: data.name,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_CLIENT_URL}/auctions/${data?.parent?.slug}/${data?.slug}`
    }
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
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild={true}>
            <Link href='/auctions'>Auctions</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild={true}>
            <Link href={`/auctions/${category?.parent?.slug}`}>{category.parent?.name}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{category.name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
      <h1 className="text-3xl font-bold">{category.name}</h1>
      <Feed initialData={data} categoryId={category.id} />
    </div>
  )
}

export default Page
