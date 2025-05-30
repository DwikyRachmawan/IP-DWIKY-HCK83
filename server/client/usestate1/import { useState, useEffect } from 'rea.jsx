import { useState, useEffect } from 'react'
import api from '../config/api'
import Swal from 'sweetalert2'

function DigimonFusion() {
  const [digimons, setDigimons] = useState([])
  const [selectedDigimon1, setSelectedDigimon1] = useState('')
  const [selectedDigimon2, setSelectedDigimon2] = useState('')
  const [fusionResult, setFusionResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingDigimons, setLoadingDigimons] = useState(true)

  useEffect(() => {
    fetchDigimons()
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
      const response = await api.post('/fusion', {
        digimon1: selectedDigimon1,
        digimon2: selectedDigimon2
      })

      setFusionResult(response.data)
      
      Swal.fire({
        icon: 'success',
        title: 'Fusion Berhasil!',
        text: 'Digimon fusion Anda telah dibuat!',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (error) {
      console.error('Fusion error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Fusion Gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan saat melakukan fusion'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingDigimons) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Memuat data Digimon...</p>
      </div>
    )
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12 text-center mb-5">
          <h1 className="display-5 text-primary fw-bold">
            ⚡ Digimon Fusion Generator
          </h1>
          <p className="lead">Gabungkan 2 Digimon dan ciptakan fusion yang amazing!</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>🔥 Pilih Digimon Pertama</h5>
            </div>
            <div className="card-body">
              <select 
                className="form-select"
                value={selectedDigimon1}
                onChange={(e) => setSelectedDigimon1(e.target.value)}
              >
                <option value="">-- Pilih Digimon --</option>
                {digimons.map((digimon, index) => (
                  <option key={index} value={digimon.name}>
                    {digimon.name} - {digimon.level}
                  </option>
                ))}
              </select>
              {selectedDigimon1 && (
                <div className="mt-3 text-center">
                  <img 
                    src={digimons.find(d => d.name === selectedDigimon1)?.img}
                    alt={selectedDigimon1}
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px' }}
                  />
                  <p className="mt-2 text-muted">
                    {digimons.find(d => d.name === selectedDigimon1)?.level}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>⚡ Pilih Digimon Kedua</h5>
            </div>
            <div className="card-body">
              <select 
                className="form-select"
                value={selectedDigimon2}
                onChange={(e) => setSelectedDigimon2(e.target.value)}
              >
                <option value="">-- Pilih Digimon --</option>
                {digimons.map((digimon, index) => (
                  <option key={index} value={digimon.name}>
                    {digimon.name} - {digimon.level}
                  </option>
                ))}
              </select>
              {selectedDigimon2 && (
                <div className="mt-3 text-center">
                  <img 
                    src={digimons.find(d => d.name === selectedDigimon2)?.img}
                    alt={selectedDigimon2}
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px' }}
                  />
                  <p className="mt-2 text-muted">
                    {digimons.find(d => d.name === selectedDigimon2)?.level}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12 text-center">
          <button 
            className="btn btn-primary btn-lg"
            onClick={handleFusion}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Generating Fusion...
              </>
            ) : (
              '🔥 Generate Fusion'
            )}
          </button>
        </div>
      </div>

      {fusionResult && (
        <div className="row mt-5">
          <div className="col-12">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">✨ Hasil Fusion</h4>
              </div>
              <div className="card-body">
                <h5 className="text-primary">{fusionResult.name}</h5>
                <p className="card-text">{fusionResult.description}</p>
                <div className="row">
                  <div className="col-md-6">
                    <strong>Level:</strong> {fusionResult.level}
                  </div>
                  <div className="col-md-6">
                    <strong>Type:</strong> {fusionResult.type}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DigimonFusion
