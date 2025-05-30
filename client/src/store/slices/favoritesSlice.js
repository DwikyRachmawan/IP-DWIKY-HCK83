import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  favorites: [],
  favoriteNames: [],
  loading: false,
  error: null
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    fetchFavoritesStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchFavoritesSuccess: (state, action) => {
      state.loading = false
      state.favorites = action.payload
      state.favoriteNames = action.payload.map(fav => fav.digimonName)
      state.error = null
    },
    fetchFavoritesFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    addFavoriteStart: (state) => {
      state.loading = true
      state.error = null
    },
    addFavoriteSuccess: (state, action) => {
      state.loading = false
      state.favorites.push(action.payload)
      state.favoriteNames.push(action.payload.digimonName)
      state.error = null
    },
    addFavoriteFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    removeFavoriteStart: (state) => {
      state.loading = true
      state.error = null
    },
    removeFavoriteSuccess: (state, action) => {
      state.loading = false
      const digimonName = action.payload
      state.favorites = state.favorites.filter(fav => fav.digimonName !== digimonName)
      state.favoriteNames = state.favoriteNames.filter(name => name !== digimonName)
      state.error = null
    },
    removeFavoriteFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    clearFavoritesError: (state) => {
      state.error = null
    },
    resetFavorites: (state) => {
      state.favorites = []
      state.favoriteNames = []
      state.loading = false
      state.error = null
    }
  }
})

export const {
  fetchFavoritesStart,
  fetchFavoritesSuccess,
  fetchFavoritesFailure,
  addFavoriteStart,
  addFavoriteSuccess,
  addFavoriteFailure,
  removeFavoriteStart,
  removeFavoriteSuccess,
  removeFavoriteFailure,
  clearFavoritesError,
  resetFavorites
} = favoritesSlice.actions

export default favoritesSlice.reducer
