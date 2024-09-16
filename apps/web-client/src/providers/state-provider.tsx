'use client'
import { useAppState } from "@/store"
import { InitialState } from "@/store/types"
import { PropsWithChildren, useEffect } from "react"

const StateProvider = (props: PropsWithChildren &  {initialState: InitialState}) => {
  const { children, initialState } = props
  const { setInitialState } = useAppState()

  useEffect(() => {
    setInitialState(initialState)
  }, [initialState, setInitialState])

  return (
    <>{children}</>
  )
}

export default StateProvider