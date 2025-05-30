import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'

function EditProfile() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          navigate('/login')
          return
        }

        const response = await fetch('http://localhost:3000/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user)
          setFormData({
            username: data.user.username || '',
            email: data.user.email || '',
            password: ''
          })
        } else {
          if (response.status === 401) {
            localStorage.removeItem('access_token')
            navigate('/login')
          } else {
            setError('Gagal mengambil data profile')
          }
        }
      } catch (error) {
        console.log(error)
        setError('Terjadi kesalahan saat mengambil data profile')
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('access_token')
      const updateData = {}
      
      // Gunakan currentUser yang sudah kita simpan di state
      if (formData.username !== currentUser.username) updateData.username = formData.username
      if (formData.email !== currentUser.email) updateData.email = formData.email
      if (formData.password.trim()) updateData.password = formData.password

      if (Object.keys(updateData).length === 0) {
        setError('Tidak ada perubahan yang dibuat')
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:3000/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Profile berhasil diperbarui!')
        setCurrentUser(data.user) // Update currentUser dengan data terbaru
        setFormData({ 
          username: data.user.username,
          email: data.user.email,
          password: '' 
        })
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setError(data.message || 'Gagal memperbarui profile')
      }
    } catch (error) {
      console.log(error)
      setError('Terjadi kesalahan saat memperbarui profile')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProfile = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.')) {
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:3000/auth/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        localStorage.removeItem('access_token')
        navigate('/login')
      } else {
        const data = await response.json()
        setError(data.message || 'Gagal menghapus akun')
      }
    } catch (error) {
        console.log(error);
        
      setError('Terjadi kesalahan saat menghapus akun')
    }
  }

  if (profileLoading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Memuat...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-center">Edit Profile</h3>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password Baru (opsional)</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                  />
                </div>
                
                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Memperbarui...' : 'Update Profile'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Kembali
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={handleDeleteProfile}
                  >
                    Hapus Akun
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfile
