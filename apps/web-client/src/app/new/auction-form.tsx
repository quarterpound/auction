'use client'

import { Button } from "@/components/ui/button"
import DragAndDrop from "@/components/ui/drag-and-drop"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useAppState } from "@/store"
import { trpc } from "@/trpc"
import { zodResolver } from "@hookform/resolvers/zod"
import { setCookie } from "cookies-next"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { createAuctionAndRegisterValidation, createAuctionValidation, CreateAuctionAndRegisterValidation } from 'server/router/auctions/validation'
import { redirectToEmailVerify } from "../(auth)/actions"
import type { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from "server/router"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"

type RouterOutput = inferRouterOutputs<AppRouter>;

interface AuctionFormProps {
  categories: RouterOutput['category']['all']
}

const AuctionForm = ({categories}: AuctionFormProps) => {
  const { authUser } = useAppState()

  const initialDate = useMemo(() => dayjs().add(8, 'day').toDate(), [])
  const createAndRegister = trpc.auctions.createAndRegister.useMutation()
  const create = trpc.auctions.create.useMutation()
  const setInitialState = useAppState(state => state.setInitialState)
  const router = useRouter()

  const form = useForm<CreateAuctionAndRegisterValidation>({
    values: {
      title: '',
      description: '',
      reservePrice: 1,
      bidIncrement: 1,
      email: '',
      password: '',
      name: '',
      assets: [],
      endTime: initialDate,
      currency: 'azn',
      categoryId: '',
    },
    resolver: zodResolver(authUser ? createAuctionValidation : createAuctionAndRegisterValidation)
  })

  const onSubmit = (data: CreateAuctionAndRegisterValidation) => {
    if(!authUser) {
      return createAndRegister.mutateAsync(data).then(({usr, jwt}) => {
        setInitialState({
          authUser: usr,
          hasMadeBids: false,
          isAuthLoading: false,
          hasPendingAuctions: true,
          favorites: []
        })

        setCookie('authorization', jwt)

        return redirectToEmailVerify()
      })
    }

    return create.mutateAsync(data).then((post) => {
      return router.push(`/auctions/${post.category?.slug}/${post.category?.parent?.slug}/${post.slug}`)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormItem className="space-y-2">
          <FormLabel>
            Title
          </FormLabel>
          <FormControl>
            <Input {...form.register('title')} placeholder="Enter auction title" />
          </FormControl>
          <FormMessage>
            {form.formState.errors.title?.message}
          </FormMessage>
        </FormItem>
        <FormItem>
          <FormLabel>
            Description
          </FormLabel>
          <FormControl>
            <Textarea className="h-[120px]" {...form.register('description')} placeholder="Provide an overview of the auction for the single item" />
          </FormControl>
          <FormMessage>
            {form.formState.errors.description?.message}
          </FormMessage>
        </FormItem>
        <FormField
          name="categoryId"
          control={form.control}
          render={({field}) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {
                      categories.map(item => (
                        <SelectGroup key={item.id}>
                          <SelectLabel>{item.name}</SelectLabel>
                          {
                            item.children.map(child => (
                              <SelectItem value={child.id} key={child.id}>
                                {child.name}
                              </SelectItem>
                            ))
                          }
                        </SelectGroup>
                      ))
                    }
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>
                {form.formState.errors.categoryId?.message}
              </FormMessage>
            </FormItem>
          )}
        />
        <FormField
          name="assets"
          control={form.control}
          render={({field}) => (
            <FormItem>
              <FormLabel>Assets</FormLabel>
              <FormControl>
                <DragAndDrop files={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage>
                {form.formState.errors.assets?.message}
              </FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endTime"
          render={({field}) => (
            <FormItem>
              <FormLabel>End Date & Time</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? dayjs(field.value).format("DD MMM YYYY HH:mm") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(f) => dayjs(f).isBefore(dayjs().add(7, 'days')) || dayjs(f).isAfter(dayjs().add(14, 'days')) }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage>
                {form.formState.errors.endTime?.message}
              </FormMessage>
              <FormDescription>
                Your auction cannot end before 7 days or end after 14 days
              </FormDescription>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormItem className="space-y-2">
            <FormLabel>Reserve Price</FormLabel>
            <FormControl>
              <Input {...form.register('reservePrice')} type="number" min="0" step="0.01" placeholder="Item starting price" />
            </FormControl>
            <FormMessage>
              {form.formState.errors.reservePrice?.message}
            </FormMessage>
          </FormItem>
          <FormItem className="space-y-2">
            <FormLabel>Bid Increment</FormLabel>
            <FormControl>
              <Input {...form.register('bidIncrement')} type="number" min="0" step="0.01" placeholder="Minimum increment for the next bid" />
            </FormControl>
            <FormMessage>
              {form.formState.errors.bidIncrement?.message}
            </FormMessage>
          </FormItem>
        </div>
        <FormField
          name="currency"
          control={form.control}
          render={({field}) => (
            <FormItem>
              <FormLabel htmlFor="currency">Currency</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[200px]">
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="azn">AZN</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>
                {form.formState.errors.currency?.message}
              </FormMessage>
            </FormItem>
          )}
        />
        {
          !authUser && (
            <div className="space-y-6">
              <Separator className="my-8" />
              <h2 className="text-2xl font-semibold mb-4">User Registration</h2>
              <div className="space-y-4">
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="name">Full Name</FormLabel>
                  <FormControl>
                    <Input {...form.register('name')} placeholder="Enter your full name" />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.name?.message}
                  </FormMessage>
                </FormItem>
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input {...form.register('email')} type="email" placeholder="Enter your email" />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.email?.message}
                  </FormMessage>
                </FormItem>
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <FormControl>
                    <Input {...form.register('password')} type="password" placeholder="Create a password" />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.password ?.message}
                  </FormMessage>
                </FormItem>
              </div>
            </div>
          )
        }
        <Button disabled={create.isPending || createAndRegister.isPending} type="submit" className="w-fit">
          {authUser ? "Create Auction" : "Create Auction and Register"}
        </Button>
      </form>
    </Form>
  )
}

export default AuctionForm
