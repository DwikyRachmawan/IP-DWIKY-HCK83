import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginStart, loginSuccess, loginFailure, clearError } from '../store/slices/authSlice'
import api from '../config/api'
import Swal from 'sweetalert2'

function Login() {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError())
    
    // Add background animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .login-container {
        background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c);
        background-size: 400% 400%;
        animation: gradientBG 15s ease infinite;
        min-height: 100vh;
      }
      
      .login-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        border-radius: 20px;
        transition: all 0.3s ease;
      }
      
      .login-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 35px 60px rgba(0, 0, 0, 0.2);
      }
      
      .login-title {
        font-weight: 700;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .form-control-custom {
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 15px 20px;
        font-size: 16px;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.9);
      }
      
      .form-control-custom:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        background: #fff;
      }
      
      .btn-login {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 12px;
        padding: 15px;
        font-weight: 600;
        font-size: 16px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .btn-login:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
      }
      
      .btn-login:active {
        transform: translateY(0);
      }
      
      .divider {
        position: relative;
        text-align: center;
        margin: 30px 0;
      }
      
      .divider::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(to right, transparent, #ddd, transparent);
      }
      
      .divider-text {
        background: rgba(255, 255, 255, 0.95);
        padding: 0 20px;
        color: #6c757d;
        font-weight: 500;
      }
      
      .google-btn-container {
        display: flex;
        justify-content: center;
        margin: 20px 0;
      }
      
      .floating-icon {
        position: absolute;
        font-size: 2rem;
        opacity: 0.1;
        animation: float 6s ease-in-out infinite;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      
      .icon-1 { top: 10%; right: 10%; animation-delay: 0s; }
      .icon-2 { top: 20%; left: 10%; animation-delay: 2s; }
      .icon-3 { bottom: 20%; right: 15%; animation-delay: 4s; }
      .icon-4 { bottom: 30%; left: 5%; animation-delay: 1s; }
    `;
    document.head.appendChild(style);
    
    // Google sign-in initialization
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin
      })

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 280
        }
      )
    }
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [dispatch])

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    dispatch(loginStart())
    
    try {
      const result = await api.post('/auth/login', {
        email,
        password
      })
      
      const { access_token } = result.data

      dispatch(loginSuccess({ token: access_token }))

      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: 'Selamat datang di Digimon Fusion Generator',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || 'Email atau password salah'
      
      dispatch(loginFailure(errorMessage))
      
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: errorMessage
      })
    }
  }

  const handleGoogleLogin = async (response) => {
    dispatch(loginStart())
    
    try {
      const result = await api.post('/auth/google-login', {
        id_token: response.credential
      })
      
      const { access_token } = result.data

      dispatch(loginSuccess({ token: access_token }))

      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: 'Selamat datang di Digimon Fusion Generator',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat login'
      
      dispatch(loginFailure(errorMessage))
      
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: errorMessage
      })
    }
  }

  return (
    <div className="login-container d-flex align-items-center justify-content-center position-relative">
      {/* Floating icons */}
      <div className="floating-icon icon-1">🔥</div>
      <div className="floating-icon icon-2">⚡</div>
      <div className="floating-icon icon-3">🌟</div>
      <div className="floating-icon icon-4">💫</div>
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4">
            <div className="login-card p-4 p-md-5">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="mb-3">
                  <span style={{ fontSize: '3rem' }}>🔥</span>
                </div>
                <h1 className="login-title h3 mb-2">Digimon Fusion</h1>
                <p className="text-muted mb-0">
                  Masuk untuk memulai petualangan fusion Digimon
                </p>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailLogin} className="mb-0">
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control form-control-custom"
                    placeholder="Masukkan email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="password"
                    className="form-control form-control-custom"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-login text-white w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Masuk...
                    </>
                  ) : (
                    'Masuk'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="divider">
                <span className="divider-text">atau</span>
              </div>

              {/* Google Sign-In */}
              <div className="google-btn-container">
                {!loading && (
                  <div id="google-signin-button"></div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center mt-4">
                <p className="text-muted mb-2">
                  Belum memiliki akun?{' '}
                  <Link to="/register" className="text-decoration-none fw-bold" style={{ color: '#667eea' }}>
                    Daftar disini
                  </Link>
                </p>
                <small className="text-muted">
                  Dengan masuk, Anda menyetujui syarat dan ketentuan kami
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show error from Redux state if needed */}
      {error && (
        <div className="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 9999 }}>
          {error}
        </div>
      )}
    </div>
  )
}

export default Login
