import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { getFaqItemBySlug } from "@/lib/content-db"
import Link from "next/link"
import { notFound } from "next/navigation"

interface FaqSlugProps {
  params: {
    slug: string
  }
}

const FaqSlug = async ({params: {slug}}: FaqSlugProps) => {
  const faq = await getFaqItemBySlug(slug)

  if(!faq) {
    notFound();
  }


  return (
    <div className="space-y-8 max-w-3xl container mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Link href='/faq'>FAQ</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {faq.question}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-bold">{faq.question}</h1>
      <div className="max-w-3xl mx-auto">
        <div dangerouslySetInnerHTML={{__html: faq.answer}} className="prose prose-lg" />
      </div>
    </div>
  )

}

export default FaqSlug
