'use client'

import { Button } from "@/components/ui/button"
import { useAppState } from "@/store"
import Link from "next/link"

const ErrorBar = () => {
  const {authUser, hasPendingAuctions} = useAppState()

  if(!authUser) {
    return <></>
  }

  if(authUser.emailVerified) {
    return <></>
  }


  if(hasPendingAuctions) {
    return <div className="bg-orange-500">
      <div className="container text-sm mx-auto py-2 flex items-center justify-between">
        <p className="text-white font-bold">You have pending auctions, please verify your email to post</p>
        <Link href={'/verify'}>
          <Button variant={'link'} className="text-white font-bold">Verify</Button>
        </Link>
      </div>
    </div>
  }

  return (
    <div className="bg-orange-500">
      <div className="container text-sm mx-auto py-2 flex items-center justify-between">
        <p className="text-white font-bold">Please verify your email</p>
      </div>
    </div>
  )
}

export default ErrorBar
