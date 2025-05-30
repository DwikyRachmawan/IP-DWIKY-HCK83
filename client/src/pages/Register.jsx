import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import api from '../config/api'
import Swal from 'sweetalert2'

function Register({ onRegister }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  })

  useEffect(() => {
    // Add background animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .register-container {
        background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c);
        background-size: 400% 400%;
        animation: gradientBG 15s ease infinite;
        min-height: 100vh;
      }
      
      .register-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        border-radius: 20px;
        transition: all 0.3s ease;
      }
      
      .register-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 35px 60px rgba(0, 0, 0, 0.2);
      }
      
      .register-title {
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
      
      .btn-register {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        border: none;
        border-radius: 12px;
        padding: 15px;
        font-weight: 600;
        font-size: 16px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .btn-register:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(245, 87, 108, 0.4);
      }
      
      .btn-register:active {
        transform: translateY(0);
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
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
       await api.post('/auth/register', formData)
      
      Swal.fire({
        icon: 'success',
        title: 'Registrasi Berhasil!',
        text: 'Akun Anda telah dibuat. Silakan login untuk melanjutkan.',
        confirmButtonText: 'Login Sekarang',
        background: 'rgba(255,255,255,0.9)',
        confirmButtonColor: '#667eea'
      }).then(() => {
        onRegister()
      })

    } catch (error) {
      console.error('Register error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Registrasi Gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan saat registrasi',
        background: 'rgba(255,255,255,0.9)',
        confirmButtonColor: '#d33'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container d-flex align-items-center justify-content-center position-relative">
      {/* Floating icons */}
      <div className="floating-icon icon-1">🔥</div>
      <div className="floating-icon icon-2">⚡</div>
      <div className="floating-icon icon-3">🌟</div>
      <div className="floating-icon icon-4">💫</div>
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4">
            <div className="register-card p-4 p-md-5">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="mb-3">
                  <span style={{ fontSize: '3rem' }}>🔥</span>
                </div>
                <h1 className="register-title h3 mb-2">Buat Akun Baru</h1>
                <p className="text-muted mb-0">
                  Daftar untuk bergabung dengan petualangan Digimon Fusion
                </p>
              </div>

              {/* Register Form */}
              <form onSubmit={handleRegister} className="mb-0">
                <div className="mb-3">
                  <input
                    type="email"
                    name="email"
                    className="form-control form-control-custom"
                    placeholder="Masukkan email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    name="username"
                    className="form-control form-control-custom"
                    placeholder="Masukkan username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="password"
                    name="password"
                    className="form-control form-control-custom"
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-register text-white w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Mendaftar...
                    </>
                  ) : (
                    'Daftar'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="text-center mt-4">
                <p className="text-muted mb-2">
                  Sudah memiliki akun?{' '}
                  <Link to="/login" className="text-decoration-none fw-bold" style={{ color: '#667eea' }}>
                    Masuk disini
                  </Link>
                </p>
                <small className="text-muted">
                  Dengan mendaftar, Anda menyetujui syarat dan ketentuan kami
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
