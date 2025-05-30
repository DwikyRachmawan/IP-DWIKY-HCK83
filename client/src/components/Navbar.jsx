import { Link } from 'react-router'
import { useEffect } from 'react'

function Navbar({ isAuthenticated, onLogout }) {
  useEffect(() => {
    // Add navbar animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .digimon-navbar {
        background: linear-gradient(-45deg, #3a0ca3, #4361ee, #4cc9f0, #4895ef);
        background-size: 400% 400%;
        animation: gradientBG 15s ease infinite;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      
      .digimon-brand {
        font-weight: 800;
        position: relative;
        transition: all 0.3s ease;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        overflow: hidden;
      }
      
      .digimon-brand:hover {
        transform: translateY(-2px);
        text-shadow: 0 2px 10px rgba(255,255,255,0.5);
      }
      
      .digimon-brand::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
        background-size: 400% 400%;
        animation: gradientBG 20s linear infinite;
        z-index: -1;
        filter: blur(8px);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .digimon-brand:hover::before {
        opacity: 0.3;
      }
      
      .nav-link {
        position: relative;
        transition: all 0.3s ease;
        margin: 0 0.25rem;
        font-weight: 500;
      }
      
      .nav-link::after {
        content: '';
        position: absolute;
        width: 0;
        height: 2px;
        bottom: 0;
        left: 50%;
        background: #ffffff;
        transition: all 0.3s ease;
        transform: translateX(-50%);
        opacity: 0;
      }
      
      .nav-link:hover::after {
        width: 80%;
        opacity: 1;
      }
      
      .nav-link:hover {
        transform: translateY(-2px);
      }
      
      .digimon-btn {
        background: linear-gradient(to right, #ff8a00, #e52e71);
        border: none;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        z-index: 1;
      }
      
      .digimon-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(to right, #e52e71, #ff8a00);
        transition: all 0.4s ease;
        z-index: -1;
      }
      
      .digimon-btn:hover::before {
        left: 0;
      }
      
      .digimon-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(229, 46, 113, 0.3);
      }
      
      .digimon-decoration {
        position: absolute;
        width: 50px;
        height: 50px;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="%23FFD700" d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z"/></svg>');
        background-size: contain;
        background-repeat: no-repeat;
        opacity: 0.1;
        z-index: 0;
      }
      
      .top-right {
        top: 5px;
        right: 20px;
      }
      
      .bottom-left {
        bottom: 5px;
        left: 20px;
      }
    `;

    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark digimon-navbar position-relative">
      {/* Decorative elements */}
      <div className="digimon-decoration top-right"></div>
      <div className="digimon-decoration bottom-left"></div>
      
      <div className="container">
        <Link className="navbar-brand digimon-brand" to={isAuthenticated ? "/dashboard" : "/"}>
          🔥 Digimon Fusion Generator
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    🏠 Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/fusion">
                    ⚡ Fusion Generator
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/favorites">
                    💖 Favorit
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/edit-profile">
                    ✏️ Edit Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <button 
                    className="btn digimon-btn text-white ms-2"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  <button className="btn digimon-btn text-white px-4">
                    Login
                  </button>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
