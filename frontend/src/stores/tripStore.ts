import { create } from 'zustand'
import type { Trip, TripResult } from '../types'

interface TripState {
  currentResult: TripResult | null
  currentTrip: Trip | null
  trips: Trip[]
  setResult: (result: TripResult | null) => void
  clearResult: () => void
  setCurrentTrip: (trip: Trip | null) => void
  setTrips: (trips: Trip[]) => void
  updateItinerary: (tripId: string, itinerary: Trip['itinerary']) => void
}

export const useTripStore = create<TripState>((set) => ({
  currentResult: null,
  currentTrip: null,
  trips: [],
  setResult: (result) => set({
    currentResult: result,
    currentTrip: result?.trip ?? null,
  }),
  clearResult: () => set({ currentResult: null, currentTrip: null }),
  setCurrentTrip: (trip) => set({
    currentTrip: trip,
    currentResult: trip ? {
      intent: 'itinerary_planning',
      summary: '',
      trip,
    } : null,
  }),
  setTrips: (trips) => set({ trips }),
  updateItinerary: (tripId, itinerary) =>
    set((state) => {
      const updatedTrip =
        state.currentTrip?.id === tripId
          ? { ...state.currentTrip, itinerary }
          : state.currentTrip
      return {
        currentTrip: updatedTrip,
        currentResult: state.currentResult
          ? { ...state.currentResult, trip: updatedTrip ?? undefined }
          : null,
      }
    }),
}))
