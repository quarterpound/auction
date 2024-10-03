import { trpcVanillaClient } from "@/trpc"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

type PageProps = {params: {parent: string}}

export const generateMetadata = async ({params: {parent}}: PageProps): Promise<Metadata> => {
  const data = await trpcVanillaClient.category.getCategoryMetadata.query({slug: parent})

  if(!data) {
    notFound()
  }

  return {
    title: data.name
  }
}

const Page = async ({params: {parent}}: PageProps) => {
  const data = await trpcVanillaClient.category.getSubCategories.query({slug: parent})

  if(!data) {
    notFound();
  }

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
            <BreadcrumbPage>{data.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-bold">{data?.name}</h1>
      <ul className="grid grid-cols-4">
        {
          data.children.map(item => (
            <li key={item.id}>
              <Link href={`/${parent}/${item.slug}`}>
                {item.name}
              </Link>
            </li>
          ))
        }
      </ul>
    </div>
  )
}

export default Page
