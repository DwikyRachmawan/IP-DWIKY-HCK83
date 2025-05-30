import { useState, useEffect } from 'react'
import api from '../config/api'
import Swal from 'sweetalert2'

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '545953666907-e8l3mmp7r96f0158tkk1vepsl6mjursa.apps.googleusercontent.com',
        callback: handleGoogleLogin
      })

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: 250
        }
      )
    }
  }, [])

  const handleGoogleLogin = async (response) => {
    setLoading(true)
    try {
      const result = await api.post('/google-login', {
        id_token: response.credential
      })

      const { access_token } = result.data

      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: 'Selamat datang di Digimon Fusion Generator',
        timer: 2000,
        showConfirmButton: false
      })

      onLogin(access_token)
    } catch (error) {
      console.error('Login error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan saat login'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-100">
        <div className="col-md-6 col-lg-4 mx-auto">
          <div className="card shadow-lg">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="card-title text-primary fw-bold">
                  🔥 Digimon Fusion
                </h2>
                <p className="text-muted">
                  Login untuk mulai membuat fusion Digimon yang amazing!
                </p>
              </div>

              <div className="text-center">
                {loading ? (
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <div id="google-signin-button"></div>
                )}
              </div>

              <div className="text-center mt-4">
                <small className="text-muted">
                  Dengan login, Anda menyetujui syarat dan ketentuan kami
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
