import {create} from 'zustand'
import { State } from './types'

const useAppState = create<State>((set) => ({
  authUser: null,
  isAuthLoading: false,
  setAuthUser: (authUser) => set({ authUser }),
  setInitialState: (initialState) => set(initialState)
}))

export {
  useAppState
}
