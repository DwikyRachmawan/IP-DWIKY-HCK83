import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.token = action.payload.token
      state.user = action.payload.user || null
      state.error = null
      
      // Save to localStorage
      localStorage.setItem('access_token', action.payload.token)
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.isAuthenticated = false
      state.token = null
      state.user = null
      state.error = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.token = null
      state.user = null
      state.loading = false
      state.error = null
      
      // Remove from localStorage
      localStorage.removeItem('access_token')
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        state.isAuthenticated = true
        state.token = token
      }
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  initializeAuth,
  clearError
} = authSlice.actions

export default authSlice.reducer
