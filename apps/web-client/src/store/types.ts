import { User, UserFavorite } from "@prisma/client"
import { FeedValidation } from "server/router/feed/validation"

export type InitialState = {
  authUser: User | null,
  favorites: UserFavorite[]
  hasMadeBids: boolean
  isAuthLoading: boolean
  hasPendingAuctions: boolean
}

export type StateVariables = InitialState & {
  feedSortOrder: FeedValidation['orderBy']
}

export type StateActions = {
  setAuthUser: (state: User) => void
  setFavorites: (favorites: UserFavorite[]) => void
  setInitialState: (state: InitialState) => void
  setHasMadeBids: (hasMadeBids: boolean) => void
  setFeedSortOrder: (feedSortOrder: FeedValidation['orderBy']) => void
}



export type State = StateVariables & StateActions
