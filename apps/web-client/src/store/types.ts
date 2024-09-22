import { User, UserFavorite } from "@prisma/client"

export type InitialState = {
  authUser: User | null,
  favorites: UserFavorite[]
  isAuthLoading: boolean
}

export type StateVariables = InitialState

export type StateActions = {
  setAuthUser: (state: User) => void
  setFavorites: (favorites: UserFavorite[]) => void
  setInitialState: (state: InitialState) => void
}



export type State = StateVariables & StateActions
