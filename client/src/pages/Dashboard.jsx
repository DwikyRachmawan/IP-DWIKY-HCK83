import { Link } from 'react-router'
import { useEffect } from 'react'

function Dashboard() {
  useEffect(() => {
    // Add dashboard animation styles
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
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      .dashboard-container {
        background: linear-gradient(-45deg, #f8f9fa, #e9ecef, #dee2e6, #ced4da);
        background-size: 400% 400%;
        animation: gradientBG 20s ease infinite;
        min-height: 100vh;
        padding: 40px 0;
      }
      
      .dashboard-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 20px;
        padding: 50px;
        margin-bottom: 40px;
        box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
        text-align: center;
        animation: fadeInUp 0.8s ease;
        position: relative;
        overflow: hidden;
      }
      
      .dashboard-header::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        animation: gradientBG 15s linear infinite;
      }
      
      .dashboard-title {
        font-size: 3.5rem;
        font-weight: 800;
        margin-bottom: 20px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        position: relative;
        z-index: 1;
      }
      
      .dashboard-subtitle {
        font-size: 1.3rem;
        opacity: 0.9;
        font-weight: 300;
        position: relative;
        z-index: 1;
      }
      
      .feature-card {
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
      
      .feature-card:hover {
        transform: translateY(-15px);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      }
      
      .feature-icon {
        font-size: 4rem;
        margin-bottom: 20px;
        animation: float 3s ease-in-out infinite;
        display: inline-block;
      }
      
      .feature-card .card-body {
        padding: 40px 30px;
        text-align: center;
      }
      
      .feature-title {
        font-size: 1.4rem;
        font-weight: 700;
        color: #333;
        margin-bottom: 15px;
      }
      
      .feature-description {
        color: #6c757d;
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 25px;
      }
      
      .feature-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 12px;
        padding: 12px 30px;
        font-weight: 600;
        color: white;
        text-decoration: none;
        transition: all 0.3s ease;
        display: inline-block;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      }
      
      .feature-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
        color: white;
        text-decoration: none;
      }
      
      .tips-section {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        border: none;
        border-radius: 20px;
        border-left: 5px solid #2196f3;
        padding: 30px;
        margin-top: 40px;
        box-shadow: 0 10px 30px rgba(33, 150, 243, 0.2);
        animation: fadeInUp 1s ease;
      }
      
      .tips-icon {
        font-size: 2rem;
        margin-right: 10px;
        animation: float 2s ease-in-out infinite;
      }
      
      .tips-title {
        color: #1976d2;
        font-weight: 700;
        font-size: 1.2rem;
        margin-bottom: 10px;
      }
      
      .tips-text {
        color: #424242;
        font-size: 1rem;
        margin: 0;
        line-height: 1.6;
      }
      
      @media (max-width: 768px) {
        .dashboard-title {
          font-size: 2.5rem;
        }
        
        .dashboard-header {
          padding: 40px 20px;
        }
        
        .feature-card .card-body {
          padding: 30px 20px;
        }
        
        .feature-icon {
          font-size: 3rem;
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

  return (
    <div className="dashboard-container">
      <div className="container">
        {/* Header Section */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            🔥 Selamat Datang di Digimon Fusion Generator!
          </h1>
          <p className="dashboard-subtitle">
            Buat kombinasi Digimon yang unik dengan kekuatan AI Gemini dan Stability AI
          </p>
        </div>

        {/* Features Section */}
        <div className="row g-4">
          <div className="col-md-6 col-lg-4">
            <div className="feature-card">
              <div className="card-body">
                <div className="feature-icon">⚡</div>
                <h5 className="feature-title">Fusion Generator</h5>
                <p className="feature-description">
                  Gabungkan 2 Digimon favorit Anda dan buat fusion yang amazing dengan teknologi AI terdepan!
                </p>
                <Link to="/fusion" className="feature-btn">
                  Mulai Fusion Sekarang
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="feature-card">
              <div className="card-body">
                <div className="feature-icon">🤖</div>
                <h5 className="feature-title">AI Powered</h5>
                <p className="feature-description">
                  Menggunakan Gemini AI untuk deskripsi dan Stability AI untuk menghasilkan model 3D yang realistis
                </p>
                <Link to="/fusion" className="feature-btn">
                  Lihat Demo AI
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="feature-card">
              <div className="card-body">
                <div className="feature-icon">✨</div>
                <h5 className="feature-title">Unlimited Possibilities</h5>
                <p className="feature-description">
                  Ribuan kombinasi Digimon menanti untuk dijelajahi dengan hasil yang selalu unik dan menarik
                </p>
                <Link to="/fusion" className="feature-btn">
                  Jelajahi Sekarang
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="tips-section">
          <h6 className="tips-title">
            <span className="tips-icon">💡</span>
            Tips Pro untuk Fusion Terbaik:
          </h6>
          <p className="tips-text">
            Pilih Digimon dengan element yang berbeda untuk hasil fusion yang lebih menarik! 
            Kombinasi seperti Fire + Water atau Light + Dark akan menghasilkan fusion yang lebih unik dan powerful.
            Jangan lupa untuk mencoba berbagai level Digimon untuk efek yang berbeda-beda.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
