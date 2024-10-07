import {create} from 'zustand'
import { State } from './types'

const useAppState = create<State>((set) => ({
  authUser: null,
  favorites: [],
  hasMadeBids: false,
  hasPendingAuctions: false,
  isAuthLoading: false,
  feedSortOrder: 'ending-soonest',
  setAuthUser: (authUser) => set({ authUser }),
  setInitialState: (initialState) => set(initialState),
  setFavorites: (favorites) => set({favorites}),
  setHasMadeBids: (hasMadeBids) => set({hasMadeBids}),
  setFeedSortOrder: (feedSortOrder) => set({feedSortOrder})
}))

export {
  useAppState
}
