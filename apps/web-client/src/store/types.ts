import { User } from "@prisma/client"

export type InitialState = {
  authUser: User | null,
  isAuthLoading: boolean
}

export type StateVariables = InitialState

export type StateActions = {
  setAuthUser: (state: User) => void
  setInitialState: (state: InitialState) => void
}



export type State = StateVariables & StateActions
