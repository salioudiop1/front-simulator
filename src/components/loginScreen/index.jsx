import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../utils/UserContext';

const LoginScreen = ({ onSubmit }) => {
  const { selectedUser } = useUserContext();
  const defaultPhone = selectedUser?.phone?.replace('+221', '') || '';
  const [phone, setPhone] = useState(defaultPhone);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [audio] = useState(new Audio('/audios/erreur-internet.mp3'));

  useEffect(() => {
    setPhone(defaultPhone);
  }, [defaultPhone]);

  useEffect(() => {
    if (showErrorModal) {
      audio.currentTime = 0;
      audio.play().then(() => {
        setIsPlayingAudio(true);
        setAudioEnded(false);
      }).catch(() => {
        setIsPlayingAudio(false);
        setAudioEnded(false);
      });
    } else {
      audio.pause();
      audio.currentTime = 0;
      setIsPlayingAudio(false);
      setAudioEnded(false);
    }
  }, [showErrorModal]);

  useEffect(() => {
    const handleAudioEnd = () => {
      setIsPlayingAudio(false);
      setAudioEnded(true);
    };

    audio.addEventListener('ended', handleAudioEnd);
    return () => {
      audio.removeEventListener('ended', handleAudioEnd);
    };
  }, [audio]);

  const handleInput = (digit) => {
    if (phone.length < 9) setPhone((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setPhone((prev) => prev.slice(0, -1));
  };

  const formatPhone = (value) => {
    const clean = value.replace(/\D/g, '');
    const parts = [];
    if (clean.length > 0) parts.push(clean.slice(0, 2));
    if (clean.length > 2) parts.push(clean.slice(2, 5));
    if (clean.length > 5) parts.push(clean.slice(5, 7));
    if (clean.length > 7) parts.push(clean.slice(7, 9));
    return parts.join(' ');
  };

  const isValid = phone === defaultPhone;

  const handleSubmit = () => {
    if (!navigator.onLine) {
      setShowErrorModal(true);
      return;
    }

    if (isValid) {
      onSubmit?.(`+221${phone}`, selectedUser?.recovery);
    }
  };

  const playAudio = () => {
    audio.currentTime = 0;
    audio.play().then(() => {
      setIsPlayingAudio(true);
      setAudioEnded(false);
    });
  };

  const renderKeypad = () => {
    const layout = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', '⌫']
    ];
    return layout.map((row, rowIndex) => (
      <div key={rowIndex} className="d-flex justify-content-center mb-2 gap-5">
        {row.map((digit, index) => (
          <button
            key={index}
            onClick={() => {
              if (digit === '⌫') handleBackspace();
              else if (digit !== '') handleInput(digit);
            }}
            className="btn btn-light"
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              fontSize: 20,
              border: '1px solid #ddd',
              backgroundColor: digit ? '#fafafa' : 'transparent',
              visibility: digit === '' ? 'hidden' : 'visible'
            }}
          >
            {digit}
          </button>
        ))}
      </div>
    ));
  };

  return (
    <div className="d-flex flex-column justify-content-between h-100 w-100 px-3 pt-3 pb-4 bg-white text-dark">
      {showErrorModal && (
        <div
          className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            top: 0,
            left: 0,
            zIndex: 999
          }}
        >
          <div
            className="bg-white rounded position-relative"
            style={{
              width: '85%',
              maxWidth: 280,
              padding: '20px 24px',
              boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
              textAlign: 'center'
            }}
          >
            {/* 🔊 ou ↻ bouton haut gauche */}
            {isPlayingAudio ? (
              <span
                className="position-absolute"
                style={{
                  top: 10,
                  left: 10,
                  fontSize: 20,
                  color: '#03A9F4',
                  animation: 'pulse 1s infinite'
                }}
              >
                <i class="fa-solid fa-volume-high"></i>
              </span>
            ) : audioEnded && (
              <button
                onClick={playAudio}
                className="position-absolute"
                style={{
                  top: 10,
                  left: 10,
                  background: 'transparent',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer'
                }}
              >
                <i class="fa-solid fa-circle-play"></i>
              </button>
            )}

            <img
              src="/images/no-internet.png"
              alt="Erreur internet"
              style={{ width: 80, height: 80, marginBottom: 16 }}
            />
            <h6 className="fw-bold mb-2" style={{ fontSize: 16, color: '#333' }}>
              Erreur internet
            </h6>
            <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
              Vérifiez votre connexion internet puis réessayez.
            </p>
            <button
              className="btn"
              style={{
                backgroundColor: '#03A9F4',
                color: 'white',
                borderRadius: 20,
                padding: '6px 24px',
                fontWeight: 'bold',
                fontSize: 14
              }}
              onClick={() => {
                setShowErrorModal(false);
                audio.pause();
                audio.currentTime = 0;
                setIsPlayingAudio(false);
                setAudioEnded(false);
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <p className="mb-3 fw-medium text-center mt-5" style={{ fontSize: 15 }}>
          Bienvenue chez wave ! Pour commencer, entrer votre numéro de mobile
        </p>
        <div className="d-flex align-items-end gap-3 mx-2 mt-5 mb-4 mx-3">
          <div
            className="d-flex align-items-center border-bottom"
            style={{ borderBottom: '2px solid #00BFFF' }}
          >
            <img src="/images/senegal.png" alt="SN" style={{ width: 24, height: 18, marginRight: 6 }} />
            <span style={{ fontSize: 18, paddingBottom: 4 }}>+221</span>
          </div>
          <div className="flex-grow-1 border-bottom" style={{ borderBottom: '2px solid #00BFFF' }}>
            <input
              type="text"
              className="border-0 bg-transparent w-100"
              style={{
                fontSize: 18,
                outline: 'none',
                padding: 0,
                letterSpacing: '1px',
                paddingBottom: 4
              }}
              value={formatPhone(phone)}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Keypad & Next */}
      <div className="text-center">
        {renderKeypad()}
        <button
          className="btn fw-bold mt-3"
          style={{
            backgroundColor: '#58D8FD',
            color: 'white',
            borderRadius: 28,
            width: '100%',
            maxWidth: 300,
            fontSize: 16,
            padding: '12px 0'
          }}
          disabled={!isValid}
          onClick={handleSubmit}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
