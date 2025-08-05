import React, { useState, useEffect, useRef } from 'react';
import { useUserContext } from '../../utils/UserContext';
import FakeNotification from '../fakeNotification';
import { format } from 'date-fns';

const PhoneCodeScreen = ({ onBack, onCodeComplete, onResend, phone }) => {
  const [code, setCode] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const errorAudioRef = useRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

  const [isBlocked, setIsBlocked] = useState(false); // à adapter si besoin

  const { selectedUser, updateUser } = useUserContext();

  const handleInput = (digit) => {
    if (code.length < 4) setCode((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setCode((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    const timeout = setTimeout(() => setShowNotification(true), 600);
    return () => clearTimeout(timeout);
  }, []);

  const playErrorAudio = () => {
    const audio = errorAudioRef.current;
    if (!audio) return;
    setCurrentAudio(audio);
    setIsPlayingAudio(true);
    setAudioEnded(false);
    audio.play();
    audio.onended = () => {
      setIsPlayingAudio(false);
      setAudioEnded(true);
    };
  };

  useEffect(() => {
    if (code.length === 4) {
      if (code === '2243') {
        onCodeComplete?.();
      } else {
        const now = new Date();
        const logError = {
          date: format(now, 'dd/MM/yyyy, HH:mm'),
          createdAt: now.getTime(), // timestamp en ms
          app: 'User',
          error: `Le client a saisi un code de validation incorrect ou qui a déja expiré.`
        };

        updateUser?.(selectedUser.id, {
          errorLogs: [...(selectedUser.errorLogs || []), logError]
        });

        setErrorMessage("Le code de validation que vous avez saisi est incorrect ou a expiré. Veuillez vérifier puis réessayer.");
        setShowErrorModal(true);
        setCode('');
        playErrorAudio();
      }
    }
  }, [code]);

  const renderKeypad = () => {
    const layout = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['Resend', '0', '⌫']
    ];
    return layout.map((row, rowIndex) => (
      <div key={rowIndex} className="d-flex justify-content-center mb-2 gap-5">
        {row.map((digit, index) => {
          if (digit === 'Resend') {
            return (
              <button key={index} onClick={onResend} className="btn" style={{
                width: 64, height: 64, fontSize: 13, fontWeight: 'bold',
                color: '#03A9F4', background: 'transparent', border: 'none'
              }}>
                Resend SMS
              </button>
            );
          }
          return (
            <button
              key={index}
              onClick={() => {
                if (digit === '⌫') handleBackspace();
                else handleInput(digit);
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
          );
        })}
      </div>
    ));
  };

  return (
    <div className="d-flex flex-column justify-content-between h-100 w-100 px-3 pt-3 pb-4 bg-white text-dark">
      <button className="position-absolute" onClick={onBack} style={{
        top: 10, left: 10, background: 'transparent', border: 'none', fontSize: 22, zIndex: 10
      }}>
        <i className="fa-solid fa-arrow-left" />
      </button>

      <div className="mt-5">
        <p className="mb-3 fw-medium text-center mt-4" style={{ fontSize: 15 }}>
          Entrez le code de validation envoyé au <strong>{phone}</strong>
        </p>
        <div className="d-flex justify-content-center gap-4 mt-5 mb-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 24,
                height: 30,
                fontSize: 24,
                fontWeight: 'bold',
                textAlign: 'center',
                borderBottom: '2px solid #ccc',
                lineHeight: '32px'
              }}
            >
              {code[i] || ''}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">{renderKeypad()}</div>

      {/* ERROR MODAL */}
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
            {isPlayingAudio ? (
              <span className="position-absolute" style={{
                top: 10, left: 10, fontSize: 20, color: '#03A9F4', animation: 'pulse 1s infinite'
              }}>
                <i className="fa-solid fa-volume-high" />
              </span>
            ) : audioEnded && (
              <button
                onClick={() => playErrorAudio()}
                className="position-absolute"
                style={{
                  top: 10, left: 10,
                  background: 'transparent',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer'
                }}
              >
                <i className="fa-solid fa-circle-play" />
              </button>
            )}

            <img
              src={isBlocked ? '/images/compte-bloque.png' : '/images/tentative-echouee.png'}
              alt="Erreur"
              style={{ width: 80, height: 80, marginBottom: 16 }}
            />
            <h6 className="fw-bold mb-2" style={{ fontSize: 16, color: '#333' }}>
              {isBlocked ? 'Compte bloqué' : 'SMS Code incorrect'}
            </h6>
            <p style={{ fontSize: 14, color: '#555', whiteSpace: 'pre-line', marginBottom: 16 }}>
              {errorMessage}
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
                currentAudio?.pause();
                setIsPlayingAudio(false);
                setAudioEnded(false);
                setCurrentAudio(null);
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showNotification && <FakeNotification message="Votre code de validation est 2243" />}

      <audio ref={errorAudioRef} src="/audios/tentative-echouee-sms-code.mp3" preload="auto" />
    </div>
  );
};

export default PhoneCodeScreen;
