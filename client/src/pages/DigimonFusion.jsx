import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { 
  fetchFavoritesStart, 
  fetchFavoritesSuccess, 
  fetchFavoritesFailure,
  addFavoriteStart,
  addFavoriteSuccess,
  addFavoriteFailure,
  removeFavoriteStart,
  removeFavoriteSuccess,
  removeFavoriteFailure
} from '../store/slices/favoritesSlice'
import api from '../config/api'
import Swal from 'sweetalert2'

function DigimonFusion() {
  const dispatch = useAppDispatch()
  const { favoriteNames, loading: favoritesLoading } = useAppSelector((state) => state.favorites)
  const [digimons, setDigimons] = useState([])
  const [selectedDigimon1, setSelectedDigimon1] = useState('')
  const [selectedDigimon2, setSelectedDigimon2] = useState('')
  const [fusionResult, setFusionResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingDigimons, setLoadingDigimons] = useState(true)

  useEffect(() => {
    fetchDigimons()
    fetchFavorites()
    
    // Enhanced CSS untuk tampilan profesional
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
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
      
      .fusion-container {
        background: linear-gradient(-45deg, #f8f9fa, #e9ecef, #dee2e6, #ced4da);
        background-size: 400% 400%;
        animation: gradientBG 20s ease infinite;
        min-height: 100vh;
        padding: 40px 0;
      }
      
      .fusion-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 20px;
        padding: 40px;
        margin-bottom: 40px;
        box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
        text-align: center;
        animation: fadeInUp 0.8s ease;
      }
      
      .fusion-title {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 15px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }
      
      .fusion-subtitle {
        font-size: 1.2rem;
        opacity: 0.9;
        font-weight: 300;
      }
      
      .digimon-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: none;
        border-radius: 20px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        overflow: hidden;
        animation: fadeInUp 0.8s ease;
      }
      
      .digimon-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      }
      
      .card-header-custom {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 20px 25px;
        font-weight: 600;
        font-size: 1.1rem;
      }
      
      .form-select-custom {
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 15px 20px;
        font-size: 16px;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.9);
      }
      
      .form-select-custom:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        background: #fff;
      }
      
      .digimon-preview {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 15px;
        padding: 20px;
        margin-top: 20px;
        text-align: center;
        transition: all 0.3s ease;
      }
      
      .digimon-preview:hover {
        background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
      }
      
      .digimon-image {
        max-height: 180px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        transition: transform 0.3s ease;
      }
      
      .digimon-image:hover {
        transform: scale(1.1);
      }
      
      .fusion-button {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        border: none;
        border-radius: 15px;
        padding: 18px 40px;
        font-weight: 700;
        font-size: 1.2rem;
        color: white;
        box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .fusion-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 40px rgba(255, 107, 107, 0.5);
        background: linear-gradient(135deg, #ee5a24 0%, #ff6b6b 100%);
      }
      
      .fusion-button:active {
        transform: translateY(0);
      }
      
      .fusion-button:disabled {
        opacity: 0.7;
        transform: none;
        animation: pulse 2s infinite;
      }
      
      .result-card {
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(25px);
        border: none;
        border-radius: 25px;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        animation: fadeInUp 1s ease;
      }
      
      .result-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      
      .result-header::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        animation: gradientBG 10s linear infinite;
      }
      
      .model-3d-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 30px;
        min-height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        box-shadow: inset 0 0 50px rgba(0,0,0,0.2);
      }
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin: 30px 0;
      }
      
      .stat-card {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 15px;
        padding: 25px;
        text-align: center;
        border: 2px solid transparent;
        transition: all 0.3s ease;
      }
      
      .stat-card:hover {
        border-color: #667eea;
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
      }
      
      .badge-custom {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }
      
      .loading-spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .info-box {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        border-left: 5px solid #2196f3;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
      }
      
      .success-box {
        background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
        border-left: 5px solid #4caf50;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
      }
      
      .warning-box {
        background: linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%);
        border-left: 5px solid #ff9800;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
      }
      
      .action-buttons {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 30px;
      }
      
      .btn-custom {
        border-radius: 12px;
        padding: 12px 25px;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      }
      
      .btn-custom:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      }
      
      @media (max-width: 768px) {
        .fusion-title {
          font-size: 2rem;
        }
        
        .fusion-header {
          padding: 30px 20px;
        }
        
        .digimon-card {
          margin-bottom: 20px;
        }
        
        .action-buttons {
          flex-direction: column;
          align-items: center;
        }
        
        .btn-custom {
          width: 100%;
          max-width: 250px;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [])

  const fetchDigimons = async () => {
    try {
      const response = await fetch('https://digimon-api.vercel.app/api/digimon')
      const data = await response.json()
      setDigimons(data.slice(0, 50))
    } catch (error) {
      console.error('Error fetching digimons:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat data Digimon'
      })
    } finally {
      setLoadingDigimons(false)
    }
  }

  const fetchFavorites = async () => {
    dispatch(fetchFavoritesStart())
    
    try {
      const response = await api.get('/favorites')
      dispatch(fetchFavoritesSuccess(response.data.data))
    } catch (error) {
      console.error('Error fetching favorites:', error)
      dispatch(fetchFavoritesFailure('Gagal memuat favorit'))
    }
  }

  const toggleFavorite = async (digimonName) => {
    try {
      const isFavorite = favoriteNames.includes(digimonName)
      
      if (isFavorite) {
        dispatch(removeFavoriteStart())
        
        await api.delete(`/favorites/${encodeURIComponent(digimonName)}`)
        
        dispatch(removeFavoriteSuccess(digimonName))
        
        Swal.fire({
          icon: 'success',
          title: 'Dihapus dari Favorit',
          text: `${digimonName} telah dihapus dari favorit`,
          timer: 1500,
          showConfirmButton: false
        })
      } else {
        dispatch(addFavoriteStart())
        
        const response = await api.post('/favorites', { digimonName })
        
        dispatch(addFavoriteSuccess(response.data.favorite))
        
        Swal.fire({
          icon: 'success',
          title: 'Ditambahkan ke Favorit',
          text: `${digimonName} telah ditambahkan ke favorit`,
          timer: 1500,
          showConfirmButton: false
        })
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      const errorMessage = error.response?.data?.message || 'Gagal mengubah status favorit'
      
      if (favoriteNames.includes(digimonName)) {
        dispatch(removeFavoriteFailure(errorMessage))
      } else {
        dispatch(addFavoriteFailure(errorMessage))
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      })
    }
  }

  const handleFusion = async () => {
    if (!selectedDigimon1 || !selectedDigimon2) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Pilih 2 Digimon untuk melakukan fusion!'
      })
      return
    }

    if (selectedDigimon1 === selectedDigimon2) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan', 
        text: 'Pilih 2 Digimon yang berbeda!'
      })
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/fusion/', {
        digimon1: selectedDigimon1,
        digimon2: selectedDigimon2
      })

    
      setFusionResult(response.data)
      
      // Check if AI image was successfully generated
      const fusionImage = response.data.fusion?.fusionImage;
      const hasGeneratedImage = fusionImage && !fusionImage.includes('placeholder');
      
      Swal.fire({
        icon: 'success',
        title: 'Fusion Berhasil!',
        html: `
          <div>
            <p>Digimon fusion Anda telah dibuat!</p>
            ${hasGeneratedImage ? 
              '<small class="text-success">✅ AI Image berhasil di-generate!</small>' : 
              '<small class="text-warning">⚠️ AI Image generation gagal, menggunakan placeholder</small>'
            }
          </div>
        `,
        timer: hasGeneratedImage ? 3000 : 2000,
        showConfirmButton: false
      })
    } catch (error) {
      console.error('Fusion error:', error)
      
      // Enhanced error handling
      let errorMessage = 'Terjadi kesalahan saat melakukan fusion';
      
      if (error.response?.status === 404) {
        errorMessage = 'Satu atau kedua Digimon tidak ditemukan';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Data input tidak valid';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Coba lagi dalam beberapa saat.';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Fusion Gagal',
        text: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingDigimons) {
    return (
      <div className="fusion-container d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <h4 className="text-muted">Memuat data Digimon...</h4>
          <p className="text-muted">Mohon tunggu sebentar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fusion-container">
      <div className="container">
        {/* Header Section */}
        <div className="fusion-header">
          <h1 className="fusion-title">🔥 Digimon Fusion Generator</h1>
          <p className="fusion-subtitle">
            Gabungkan dua Digimon pilihan Anda dan ciptakan fusion yang menakjubkan dengan teknologi AI
          </p>
        </div>

        {/* Selection Section */}
        <div className="row g-4 mb-5">
          <div className="col-lg-6">
            <div className="digimon-card h-100">
              <div className="card-header-custom">
                <h5 className="mb-0">🎯 Pilih Digimon Pertama</h5>
              </div>
              <div className="card-body p-4">
                <select 
                  className="form-select form-select-custom"
                  value={selectedDigimon1}
                  onChange={(e) => setSelectedDigimon1(e.target.value)}
                  disabled={loading}
                >
                  <option value="">-- Pilih Digimon Pertama --</option>
                  {digimons.map((digimon, index) => (
                    <option key={index} value={digimon.name}>
                      {digimon.name} ({digimon.level}) {favoriteNames.includes(digimon.name) ? '💖' : ''}
                    </option>
                  ))}
                </select>
                
                {selectedDigimon1 && (
                  <div className="digimon-preview">
                    <img 
                      src={digimons.find(d => d.name === selectedDigimon1)?.img}
                      alt={selectedDigimon1}
                      className="digimon-image"
                    />
                    <h6 className="mt-3 mb-2 text-primary fw-bold">{selectedDigimon1}</h6>
                    <div className="d-flex justify-content-center gap-2 mb-3">
                      <span className="badge badge-custom">
                        {digimons.find(d => d.name === selectedDigimon1)?.level}
                      </span>
                      {favoriteNames.includes(selectedDigimon1) && (
                        <span className="badge bg-danger">💖 Favorit</span>
                      )}
                    </div>
                    <button
                      className={`btn btn-sm ${favoriteNames.includes(selectedDigimon1) ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => toggleFavorite(selectedDigimon1)}
                      disabled={loading || favoritesLoading}
                    >
                      {favoritesLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1"></span>
                          Loading...
                        </>
                      ) : favoriteNames.includes(selectedDigimon1) ? '💔 Hapus Favorit' : '💖 Tambah Favorit'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="digimon-card h-100">
              <div className="card-header-custom">
                <h5 className="mb-0">🎯 Pilih Digimon Kedua</h5>
              </div>
              <div className="card-body p-4">
                <select 
                  className="form-select form-select-custom"
                  value={selectedDigimon2}
                  onChange={(e) => setSelectedDigimon2(e.target.value)}
                  disabled={loading}
                >
                  <option value="">-- Pilih Digimon Kedua --</option>
                  {digimons.map((digimon, index) => (
                    <option key={index} value={digimon.name}>
                      {digimon.name} ({digimon.level}) {favoriteNames.includes(digimon.name) ? '💖' : ''}
                    </option>
                  ))}
                </select>
                
                {selectedDigimon2 && (
                  <div className="digimon-preview">
                    <img 
                      src={digimons.find(d => d.name === selectedDigimon2)?.img}
                      alt={selectedDigimon2}
                      className="digimon-image"
                    />
                    <h6 className="mt-3 mb-2 text-primary fw-bold">{selectedDigimon2}</h6>
                    <div className="d-flex justify-content-center gap-2 mb-3">
                      <span className="badge badge-custom">
                        {digimons.find(d => d.name === selectedDigimon2)?.level}
                      </span>
                      {favoriteNames.includes(selectedDigimon2) && (
                        <span className="badge bg-danger">💖 Favorit</span>
                      )}
                    </div>
                    <button
                      className={`btn btn-sm ${favoriteNames.includes(selectedDigimon2) ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => toggleFavorite(selectedDigimon2)}
                      disabled={loading || favoritesLoading}
                    >
                      {favoritesLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1"></span>
                          Loading...
                        </>
                      ) : favoriteNames.includes(selectedDigimon2) ? '💔 Hapus Favorit' : '💖 Tambah Favorit'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fusion Button */}
        <div className="text-center mb-5">
          <button 
            className="fusion-button"
            onClick={handleFusion}
            disabled={loading || !selectedDigimon1 || !selectedDigimon2}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Generating Fusion...
              </>
            ) : (
              <>
                ⚡ Generate AI Fusion
              </>
            )}
          </button>
          
          {selectedDigimon1 && selectedDigimon2 && (
            <div className="mt-3">
              <small className="text-muted">
                Akan menggabungkan <strong>{selectedDigimon1}</strong> + <strong>{selectedDigimon2}</strong>
              </small>
            </div>
          )}
        </div>

        {/* Results Section */}
        {fusionResult && (
          <div className="row">
            <div className="col-12">
              <div className="result-card">
                <div className="result-header">
                  <h2 className="mb-2">✨ Hasil Fusion AI</h2>
                  <p className="mb-0 opacity-90">Digimon fusion yang dihasilkan oleh kecerdasan buatan</p>
                </div>
                
                <div className="card-body p-5">
                  {/* AI Generated Image Display */}
                  {(() => {
                    const fusion = fusionResult.fusion || fusionResult;
                    const fusionImageUrl = fusion?.fusionImage;
                    
                    if (fusionImageUrl) {
                      if (fusionImageUrl.includes('placeholder')) {
                        // Placeholder image
                        return (
                          <div className="text-center mb-5">
                            <div className="model-3d-container">
                              <div className="text-center text-white">
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔥⚡🤖</div>
                                <h3 className="fw-bold mb-3">
                                  {fusion?.name || `${selectedDigimon1}${selectedDigimon2}`}
                                </h3>
                                <p className="mb-4 opacity-90">AI Fusion Digimon</p>
                                
                                <div className="warning-box">
                                  <h6 className="text-warning mb-2">⚠️ AI Image Generation Failed</h6>
                                  <p className="mb-0">Menggunakan placeholder sementara. Deskripsi AI tetap berhasil dibuat.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (fusionImageUrl.startsWith('data:image')) {
                        // Base64 generated image
                        return (
                          <div className="text-center mb-5">
                            <div className="position-relative d-inline-block">
                              <img 
                                src={fusionImageUrl}
                                alt={fusion?.name || 'AI Fusion'}
                                className="img-fluid rounded shadow-lg"
                                style={{ 
                                  maxHeight: '400px', 
                                  borderRadius: '20px',
                                  border: '3px solid #667eea'
                                }}
                              />
                              <div className="position-absolute top-0 start-0 m-2">
                                <span className="badge bg-success px-3 py-2">
                                  🎨 AI Generated
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="success-box">
                                <h5 className="text-success mb-3">🎉 AI Image Generation Success!</h5>
                                <p className="mb-3">Gambar fusion berhasil dibuat dengan Stability AI</p>
                                <button 
                                  className="btn btn-success btn-custom"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.download = `fusion-${fusion?.name || `${selectedDigimon1}${selectedDigimon2}`}.jpg`;
                                    link.href = fusionImageUrl;
                                    link.click();
                                  }}
                                >
                                  📥 Download AI Image
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // Regular URL image
                        return (
                          <div className="text-center mb-5">
                            <div className="position-relative d-inline-block">
                              <img 
                                src={fusionImageUrl}
                                alt={fusion?.name || 'AI Fusion'}
                                className="img-fluid rounded shadow-lg"
                                style={{ 
                                  maxHeight: '400px', 
                                  borderRadius: '20px',
                                  border: '3px solid #667eea'
                                }}
                                onError={(e) => {
                                  e.target.src = `https://via.placeholder.com/400x400/667eea/FFFFFF?text=${encodeURIComponent(fusion?.name || 'AI Fusion')}`;
                                }}
                              />
                              <div className="position-absolute top-0 start-0 m-2">
                                <span className="badge bg-info px-3 py-2">
                                  🖼️ Alternative Image
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    }
                    
                    // Fallback if no image
                    return (
                      <div className="text-center mb-5">
                        <div className="model-3d-container">
                          <div className="text-center text-white">
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎭✨🔮</div>
                            <h3 className="fw-bold mb-3">
                              {fusion?.name || `${selectedDigimon1}${selectedDigimon2}`}
                            </h3>
                            <p className="mb-4 opacity-90">AI Fusion Digimon</p>
                            
                            <div className="info-box">
                              <h6 className="text-info mb-2">ℹ️ Text-Only Fusion</h6>
                              <p className="mb-0">Fusion berhasil dibuat dengan deskripsi AI yang detail.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Fusion Info */}
                  <div className="text-center mb-4">
                    <h3 className="text-primary fw-bold mb-2">
                      {fusionResult.fusion?.name || fusionResult.name || 'AI Fusion Digimon'}
                    </h3>
                    <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
                      <span className="badge badge-custom">{selectedDigimon1}</span>
                      <span style={{ fontSize: '1.5rem', color: '#667eea' }}>+</span>
                      <span className="badge badge-custom">{selectedDigimon2}</span>
                      <span style={{ fontSize: '1.5rem', color: '#667eea' }}>=</span>
                      <span className="badge bg-success text-white px-3 py-2">AI Fusion</span>
                    </div>
                  </div>

                  {/* Description */}
                  {(() => {
                    const fusion = fusionResult.fusion || fusionResult;
                    const description = fusion?.description || fusion?.fusionDescription;
                    
                    if (description) {
                      return (
                        <div className="info-box mb-4">
                          <h6 className="text-primary mb-3">📝 Deskripsi AI Fusion:</h6>
                          <p className="mb-0 lead">{description}</p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Stats Grid */}
                  <div className="stats-grid">
                    <div className="stat-card">
                      <h6 className="text-muted mb-2">Level</h6>
                      <h4 className="text-primary fw-bold">
                        {fusionResult.fusion?.level || fusionResult.level || 'Champion'}
                      </h4>
                    </div>
                    <div className="stat-card">
                      <h6 className="text-muted mb-2">Type</h6>
                      <h4 className="text-primary fw-bold">
                        {fusionResult.fusion?.type || fusionResult.type || 'Data'}
                      </h4>
                    </div>
                    <div className="stat-card">
                      <h6 className="text-muted mb-2">Status</h6>
                      <h4 className="text-success fw-bold">Fusion Success</h4>
                    </div>
                  </div>

                  {/* Original Digimons */}
                  {(() => {
                    const fusion = fusionResult.fusion || fusionResult;
                    const originalImages = fusion?.originalImages;
                    
                    if (originalImages) {
                      return (
                        <div className="info-box">
                          <h6 className="text-primary mb-4 text-center">🔄 Digimon Original yang Difusion</h6>
                          <div className="row g-4">
                            <div className="col-6 text-center">
                              <img 
                                src={originalImages.digimon1}
                                alt={selectedDigimon1}
                                className="img-fluid rounded shadow"
                                style={{ maxHeight: '120px' }}
                              />
                              <h6 className="mt-2 text-primary fw-bold">{selectedDigimon1}</h6>
                              {favoriteNames.includes(selectedDigimon1) && (
                                <div><small className="text-danger">💖 Favorit</small></div>
                              )}
                            </div>
                            <div className="col-6 text-center">
                              <img 
                                src={originalImages.digimon2}
                                alt={selectedDigimon2}
                                className="img-fluid rounded shadow"
                                style={{ maxHeight: '120px' }}
                              />
                              <h6 className="mt-2 text-primary fw-bold">{selectedDigimon2}</h6>
                              {favoriteNames.includes(selectedDigimon2) && (
                                <div><small className="text-danger">💖 Favorit</small></div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button 
                      className="btn btn-outline-primary btn-custom"
                      onClick={() => {
                        setFusionResult(null);
                        setSelectedDigimon1('');
                        setSelectedDigimon2('');
                      }}
                    >
                      🔄 Generate Fusion Baru
                    </button>
                    
                    {(() => {
                      const fusion = fusionResult.fusion || fusionResult;
                      const imageUrl = fusion?.fusionImage;
                      
                      // Only show download if it's a generated image (not placeholder)
                      if (imageUrl && !imageUrl.includes('placeholder')) {
                        return (
                          <button 
                            className="btn btn-info btn-custom"
                            onClick={() => {
                              if (imageUrl.startsWith('data:image')) {
                                // Base64 image
                                const link = document.createElement('a');
                                link.download = `fusion-${fusion?.name || `${selectedDigimon1}${selectedDigimon2}`}.jpg`;
                                link.href = imageUrl;
                                link.click();
                              } else {
                                // URL image
                                window.open(imageUrl, '_blank');
                              }
                            }}
                          >
                            💾 Download Gambar
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DigimonFusion
