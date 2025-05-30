// App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { initializeAuth, logout } from './store/slices/authSlice'
import { resetFavorites } from './store/slices/favoritesSlice'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DigimonFusion from './pages/DigimonFusion'
import Favorites from './pages/Favorites'
import EditProfile from './pages/EditProfile'
import './App.css'

function AppContent() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth)
  const location = useLocation()

  useEffect(() => {
    // Initialize auth state from localStorage
    dispatch(initializeAuth())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logout())
    dispatch(resetFavorites())
  }

  const handleRegister = () => {
    // Redirect to login after successful registration
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  const showNavbar = location.pathname !== '/login' && location.pathname !== '/register'

  return (
    <div className="App">
      {showNavbar && <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />}
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register onRegister={handleRegister} />}
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route 
          path="/fusion" 
          element={isAuthenticated ? <DigimonFusion /> : <Navigate to="/login" />}
        />
        <Route 
          path="/favorites" 
          element={isAuthenticated ? <Favorites /> : <Navigate to="/login" />}
        />
        <Route 
          path="/edit-profile" 
          element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />}
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
