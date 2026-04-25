import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = location.pathname.startsWith('/mobile');

  const goBack = () => {
    navigate(isMobile ? '/mobile' : '/');
  };

  return (
    <div
      className={`${isMobile ? 'fixed inset-0 pb-40' : 'min-h-screen'} flex items-center justify-center px-4 overflow-hidden`}
      style={{
        background: '#1B0034',
        backgroundImage: 'linear-gradient(135deg, #1B0034 10%, #33265C 100%)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Combo&display=swap');
        
        .error-container {
          width: 100%;
          text-align: center;
        }
        
        .error-text {
          color: #C0D7DD;
          font-size: clamp(120px, 25vw, 280px);
          font-family: 'Combo', cursive;
          display: inline-block;
          vertical-align: middle;
        }
        
        .dracula-container {
          width: 180px;
          height: 180px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          vertical-align: middle;
          position: relative;
          margin: 0 -10px;
        }
        
        .dracula-inner {
          position: relative;
          width: 120px;
          height: 120px;
          animation: bounce 0.7s ease-in-out infinite alternate;
        }
        
        @keyframes bounce {
          0% { transform: translateY(5px); }
          100% { transform: translateY(15px); }
        }
        
        .hair, .hair-r, .head, .eye, .eye-r, .mouth, .blod, .blod2 {
          position: absolute;
        }
        
        .hair {
          top: -10px;
          left: 0;
          width: 105px;
          height: 100px;
          background: #33265C;
          border-radius: 0 50% 0 50%;
          transform: rotate(45deg);
        }
        
        .hair-r {
          top: 0;
          left: 10px;
          width: 105px;
          height: 100px;
          background: #33265C;
          border-radius: 0 50% 0 50%;
          transform: rotate(45deg);
        }
        
        .head {
          top: 0;
          left: 0;
          width: 100px;
          height: 100px;
          background: #C0D7DD;
          border-radius: 0 50% 0 50%;
          transform: rotate(45deg);
        }
        
        .eye {
          width: 10px;
          height: 10px;
          background: #111113;
          border-radius: 50%;
          top: 15%;
          left: 11.5%;
        }
        
        .eye-r {
          left: 24%;
        }
        
        .mouth {
          width: 30px;
          height: 10px;
          background: #840021;
          top: 20%;
          left: 14%;
          border-radius: 0 0 50% 50%;
        }
        
        .mouth::after,
        .mouth::before {
          content: '';
          position: absolute;
          border-left: 3px solid transparent;
          border-right: 3px solid transparent;
          border-top: 7px solid #FFFFFF;
        }
        
        .mouth::after { left: 5px; }
        .mouth::before { left: 20px; }
        
        .blod {
          width: 4px;
          height: 10px;
          background: #840021;
          top: 23%;
          left: 17%;
          border-radius: 10px;
        }
        
        .blod::after {
          content: '';
          position: absolute;
          width: 1px;
          height: 5px;
          background: #FFF;
          top: 20%;
          left: 10%;
          border-radius: 10px;
        }
        
        .blod2 {
          top: 23%;
          left: 20%;
          width: 7px;
          height: 7px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(130deg);
          animation: bloodDrop 2s linear infinite;
          opacity: 0;
        }
        
        @keyframes bloodDrop {
          0% { opacity: 1; }
          100% { background: red; opacity: 0; top: 50%; }
        }
        
        .page-message {
          margin-top: 10px;
        }
        
        .message-text {
          color: #C0D7DD;
          font-size: clamp(18px, 4vw, 30px);
          font-family: 'Combo', cursive;
          margin-bottom: 20px;
        }
        
        .go-back-btn {
          font-size: clamp(20px, 4vw, 30px);
          font-family: 'Combo', cursive;
          border: none;
          padding: 10px 30px;
          cursor: pointer;
          transition: 0.3s linear;
          border-radius: 10px;
          background: #C0D7DD;
          color: #33265C;
          box-shadow: 0 0 10px 0 #C0D7DD;
        }
        
        .go-back-btn:hover {
          box-shadow: 0 0 25px 0 #C0D7DD;
          transform: scale(1.05);
        }
      `}</style>

      <div className="error-container">
        <div className="flex items-center justify-center flex-wrap">
          <span className="error-text">4</span>

          {/* Dracula Character */}
          <div className="dracula-container">
            <div className="dracula-inner">
              <div className="hair"></div>
              <div className="hair-r"></div>
              <div className="head"></div>
              <div className="eye"></div>
              <div className="eye eye-r"></div>
              <div className="mouth"></div>
              <div className="blod"></div>
              <div className="blod blod2"></div>
            </div>
          </div>

          <span className="error-text">4</span>
        </div>

        <div className="page-message">
          <p className="message-text">Oops, sahifa topilmadi!</p>
          <button className="go-back-btn" onClick={goBack}>
            Bosh sahifaga
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
