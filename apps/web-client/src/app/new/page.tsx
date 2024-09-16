import AuctionForm from "./auction-form"

const New = () => {
  return (
    <main className="space-y-8">
      <div className="bg-zinc-100">
        <h1 className="text-foreground container mx-auto text-lg font-bold py-4">ELAN YERLƏŞDİRMƏK</h1>
      </div>
      <div className="container mx-auto grid gap-8  md:px-0 px-8">
        <AuctionForm />
      </div>
    </main>
  )
}

export default New
