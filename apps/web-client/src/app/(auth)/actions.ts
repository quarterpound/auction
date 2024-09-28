'use server'

import { redirect } from "next/navigation"

export const redirectToHome = async () => {
  redirect('/')
}

export const redirectToEmailVerify = async () => {
  redirect('/verify-email')
}
