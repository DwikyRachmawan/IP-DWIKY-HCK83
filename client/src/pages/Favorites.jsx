import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { 
  fetchFavoritesStart, 
  fetchFavoritesSuccess, 
  fetchFavoritesFailure,
  removeFavoriteStart,
  removeFavoriteSuccess,
  removeFavoriteFailure
} from '../store/slices/favoritesSlice'
import api from '../config/api'
import Swal from 'sweetalert2'

function Favorites() {
  const dispatch = useAppDispatch()
  const { favorites, loading, error } = useAppSelector((state) => state.favorites)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFavorites()
    
    // Add favorites page styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .favorites-container {
        background: linear-gradient(-45deg, #f8f9fa, #e9ecef, #dee2e6, #ced4da);
        background-size: 400% 400%;
        animation: gradientBG 20s ease infinite;
        min-height: 100vh;
        padding: 40px 0;
      }
      
      .favorites-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 20px;
        padding: 40px;
        margin-bottom: 40px;
        box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
        text-align: center;
        animation: fadeInUp 0.8s ease;
      }
      
      .favorites-title {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 15px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }
      
      .search-container {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 30px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      }
      
      .search-input {
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 15px 20px;
        font-size: 16px;
        transition: all 0.3s ease;
      }
      
      .search-input:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
      }
      
      .favorite-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: none;
        border-radius: 20px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        overflow: hidden;
        animation: fadeInUp 0.8s ease;
        height: 100%;
      }
      
      .favorite-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      }
      
      .digimon-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 15px;
        transition: transform 0.3s ease;
      }
      
      .digimon-image:hover {
        transform: scale(1.05);
      }
      
      .remove-btn {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        border: none;
        border-radius: 12px;
        padding: 10px 20px;
        color: white;
        font-weight: 600;
        transition: all 0.3s ease;
        width: 100%;
      }
      
      .remove-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
      }
      
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        margin: 40px 0;
      }
      
      .empty-icon {
        font-size: 4rem;
        margin-bottom: 20px;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [])

  const fetchFavorites = async () => {
    dispatch(fetchFavoritesStart())
    
    try {
      const response = await api.get('/favorites')
      dispatch(fetchFavoritesSuccess(response.data.data))
    } catch (error) {
      console.error('Error fetching favorites:', error)
      dispatch(fetchFavoritesFailure('Gagal memuat daftar favorit'))
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat daftar favorit'
      })
    }
  }

  const removeFavorite = async (digimonName) => {
    try {
      const result = await Swal.fire({
        title: 'Hapus Favorit?',
        text: `Apakah Anda yakin ingin menghapus ${digimonName} dari favorit?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      })

      if (result.isConfirmed) {
        dispatch(removeFavoriteStart())
        
        await api.delete(`/favorites/${encodeURIComponent(digimonName)}`)
        
        dispatch(removeFavoriteSuccess(digimonName))
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `${digimonName} telah dihapus dari favorit`,
          timer: 2000,
          showConfirmButton: false
        })
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      dispatch(removeFavoriteFailure('Gagal menghapus favorit'))
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal menghapus favorit'
      })
    }
  }

  const filteredFavorites = favorites.filter(favorite =>
    favorite.digimonName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && favorites.length === 0) {
    return (
      <div className="favorites-container d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }}></div>
          <h4 className="text-muted mt-3">Memuat favorit Anda...</h4>
        </div>
      </div>
    )
  }

  return (
    <div className="favorites-container">
      <div className="container">
        {/* Header */}
        <div className="favorites-header">
          <h1 className="favorites-title">💖 Digimon Favorit Saya</h1>
          <p className="mb-0 opacity-90">
            Kelola koleksi Digimon favorit Anda
          </p>
        </div>

        {/* Search */}
        <div className="search-container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control search-input"
                placeholder="🔍 Cari Digimon favorit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4 mt-3 mt-md-0 text-md-end">
              <div className="text-muted">
                <strong>{filteredFavorites.length}</strong> dari <strong>{favorites.length}</strong> favorit
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Favorites Grid */}
        {filteredFavorites.length > 0 ? (
          <div className="row g-4">
            {filteredFavorites.map((favorite) => (
              <div key={favorite.id} className="col-md-6 col-lg-4 col-xl-3">
                <div className="favorite-card">
                  <div className="p-3">
                    <img
                      src={favorite.digimonImage}
                      alt={favorite.digimonName}
                      className="digimon-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h5 className="fw-bold text-primary mb-2">{favorite.digimonName}</h5>
                    <div className="mb-3">
                      <span className="badge bg-primary">{favorite.digimonLevel}</span>
                    </div>
                    <div className="text-muted small mb-3">
                      Ditambahkan: {new Date(favorite.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeFavorite(favorite.digimonName)}
                    >
                      🗑️ Hapus dari Favorit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💔</div>
            <h3 className="text-muted mb-3">
              {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada Digimon favorit'}
            </h3>
            <p className="text-muted mb-4">
              {searchTerm 
                ? `Tidak ditemukan Digimon dengan nama "${searchTerm}"`
                : 'Mulai tambahkan Digimon favorit Anda dari halaman Fusion Generator!'
              }
            </p>
            {!searchTerm && (
              <Link to="/fusion" className="btn btn-primary btn-lg">
                ⚡ Ke Fusion Generator
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites
