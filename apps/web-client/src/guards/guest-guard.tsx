'use client'

import { useAppState } from "@/store"
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react"

const GuestGuard = (props: PropsWithChildren) => {
  const { children } = props
  const router = useRouter();

  const { authUser, isAuthLoading } = useAppState()

  if (isAuthLoading) {
    return <div>Loading...</div>
  }

  if (authUser && !isAuthLoading) {
    router.push('/')
    return <div className="container mx-auto">Redirecting...</div>
  }

  return <>{children}</>
}

export default GuestGuard
