import {create} from 'zustand'
import { State } from './types'

const useAppState = create<State>((set) => ({
  authUser: null,
  favorites: [],
  isAuthLoading: false,
  setAuthUser: (authUser) => set({ authUser }),
  setInitialState: (initialState) => set(initialState),
  setFavorites: (favorites) => set({favorites})
}))

export {
  useAppState
}
