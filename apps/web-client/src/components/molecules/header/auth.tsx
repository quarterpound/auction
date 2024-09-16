'use client'

import { useAppState } from "@/store"
import Link from "next/link"

const AuthButtons = () => {
  const authUser = useAppState(state => state.authUser)
  const isAuthLoading = useAppState(state => state.isAuthLoading)

  if(isAuthLoading) {
    return <></>
  }

  if(authUser) {
    return <nav className="flex items-center space-x-4">
      <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href={'/profile'}>{`${authUser.name}`}</Link>
    </nav>
  }

  return (
    <nav className="flex items-center space-x-4 text-sm">
      <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
        Sign In
      </Link>
      <Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors">
        Sign Up
      </Link>
    </nav>
  )
}

export default AuthButtons
