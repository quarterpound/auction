'use client'

import { useForm } from "react-hook-form"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { trpc } from "@/trpc"
import { toast } from "sonner"

const NewsletterSignup = () => {

  const form = useForm<{email: string}>({
    values: {
      email: ''
    },
    resolver: zodResolver(z.object({email: z.string().email()}))
  })

  const subscribeMutation = trpc.general.signUpToNewsletter.useMutation({
    onSuccess: () => {
      toast.success('Thank you for signing up!')
    }
  })

  const handleSubmit = (data: {email: string}) => {
    return subscribeMutation.mutate(data)
  }

  if(form.formState.isSubmitSuccessful) {
    return <p className="font-semibold">Thank your for signing up</p>
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
      <Input {...form.register('email')} className='bg-white' placeholder='Email' />
      <Button type="submit" size="sm" disabled={subscribeMutation.isPending}>Subscribe</Button>
    </form>
  )
}

export default NewsletterSignup
