import { User, UserFavorite } from "@prisma/client"

export type InitialState = {
  authUser: User | null,
  favorites: UserFavorite[]
  hasMadeBids: boolean
  isAuthLoading: boolean
}

export type StateVariables = InitialState

export type StateActions = {
  setAuthUser: (state: User) => void
  setFavorites: (favorites: UserFavorite[]) => void
  setInitialState: (state: InitialState) => void
  setHasMadeBids: (hasMadeBids: boolean) => void
}



export type State = StateVariables & StateActions
