import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getFaqItems } from "@/lib/content-db"

export const dynamic = 'force-dynamic'

const FaqPage = async () => {

  const faqData = await getFaqItems()

  return (
    <div className="space-y-8 container mx-auto">
      <h1 className="text-3xl font-bold text-center">Tez-tez verilən suallar</h1>
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <div dangerouslySetInnerHTML={{__html: item.answer}} className="prose prose-lg" />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}

export default FaqPage
