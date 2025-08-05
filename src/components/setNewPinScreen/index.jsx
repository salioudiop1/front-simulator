import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../utils/UserContext';
import { format } from 'date-fns';

const SetNewPinScreen = ({ onBack, onSuccess }) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState('set');

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [currentAudio] = useState(() => new Audio('/audios/pin-non-identiques.mp3'));

  const [successAudio] = useState(() => new Audio('/audios/success.mp3'));
  const [isSuccessAudioPlaying, setIsSuccessAudioPlaying] = useState(false);
  const [successAudioEnded, setSuccessAudioEnded] = useState(false);

  const { selectedUser, updateUser } = useUserContext();

  useEffect(() => {
    const handleAudioEnd = () => {
      setIsPlayingAudio(false);
      setAudioEnded(true);
    };

    if (currentAudio) {
      currentAudio.addEventListener('ended', handleAudioEnd);
    }

    return () => {
      if (currentAudio) {
        currentAudio.removeEventListener('ended', handleAudioEnd);
      }
    };
  }, [currentAudio]);

  useEffect(() => {
    const handleSuccessEnd = () => {
      setIsSuccessAudioPlaying(false);
      setSuccessAudioEnded(true);
    };

    successAudio.addEventListener('ended', handleSuccessEnd);
    return () => successAudio.removeEventListener('ended', handleSuccessEnd);
  }, [successAudio]);

  const handleInput = (digit) => {
    if (step === 'set' && newPin.length < 4) setNewPin((prev) => prev + digit);
    if (step === 'confirm' && confirmPin.length < 4) setConfirmPin((prev) => prev + digit);
  };

  const handleBackspace = () => {
    if (step === 'set') setNewPin((prev) => prev.slice(0, -1));
    else setConfirmPin((prev) => prev.slice(0, -1));
  };

  const playAudio = () => {
    if (currentAudio) {
      currentAudio.currentTime = 0;
      currentAudio.play();
      setIsPlayingAudio(true);
      setAudioEnded(false);
    }
  };

  const handleValidation = () => {
    if (confirmPin === newPin) {
      try {
        updateUser?.(selectedUser.id, {
          codePin: newPin,
          recovery: false
        });
        setShowSuccessModal(true);
        successAudio.play();
        setIsSuccessAudioPlaying(true);
        setSuccessAudioEnded(false);
      } catch (e) {
        console.error('Erreur lors de updateUser :', e);
      }
    } else {
      // ➕ Ajouter erreur dans errorLogs
      const now = new Date();
      const newLog = {
        date: format(now, 'dd/MM/yyyy, HH:mm'),
        createdAt: now.getTime(), // timestamp en ms
        app: 'User',
        error: 'Le client a saisi deux codes différents lors de la modification de son code secret.'
      };
      updateUser?.(selectedUser.id, {
        errorLogs: [...(selectedUser.errorLogs || []), newLog]
      });

      setShowErrorModal(true);
      playAudio();
      setConfirmPin('');
    }
  };

  const renderDots = (pin) => (
    <div className="d-flex justify-content-center gap-3 mt-5 mb-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: pin.length > i ? '#00BFFF' : '#ccc'
          }}
        ></div>
      ))}
    </div>
  );

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

  useEffect(() => {
    if (step === 'set' && newPin.length === 4) setStep('confirm');
    if (step === 'confirm' && confirmPin.length === 4) handleValidation();
  }, [newPin, confirmPin, step]);

  return (
    <div className="d-flex flex-column justify-content-between h-100 w-100 px-3 pt-3 pb-4 bg-white text-dark">
      <button
        className="position-absolute"
        onClick={onBack}
        style={{
          top: 10,
          left: 10,
          background: 'transparent',
          border: 'none',
          fontSize: 22,
          color: '#333',
          zIndex: 10
        }}
      >
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <div>
        <p className="mb-3 fw-medium text-center mt-5" style={{ fontSize: 15 }}>
          {step === 'set' ? 'Définir un nouveau code secret' : 'Confirmer votre nouveau code secret'}
        </p>
        {renderDots(step === 'set' ? newPin : confirmPin)}
      </div>

      <div className="text-center">{renderKeypad()}</div>

      {/* ❌ Modal PIN non identiques */}
      {showErrorModal && (
        <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', top: 0, left: 0, zIndex: 999 }}>
          <div className="bg-white rounded position-relative text-center"
            style={{ width: '85%', maxWidth: 280, padding: '20px 24px', boxShadow: '0 6px 12px rgba(0,0,0,0.2)' }}>
            {isPlayingAudio ? (
              <span className="position-absolute" style={{ top: 10, left: 10, fontSize: 20, color: '#03A9F4', animation: 'pulse 1s infinite' }}>
                <i className="fa-solid fa-volume-high"></i>
              </span>
            ) : audioEnded && (
              <button
                onClick={playAudio}
                className="position-absolute"
                style={{ top: 10, left: 10, background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}
              >
                <i className="fa-solid fa-circle-play"></i>
              </button>
            )}
            <img src="/images/tentative-echouee.png" alt="Erreur" style={{ width: 80, height: 80, marginBottom: 16 }} />
            <h6 className="fw-bold mb-2" style={{ fontSize: 16, color: '#333' }}>Code non identiques</h6>
            <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
              Les deux codes saisis ne correspondent pas. Veuillez réessayer.
            </p>
            <button
              className="btn"
              style={{ backgroundColor: '#03A9F4', color: 'white', borderRadius: 20, padding: '6px 24px', fontWeight: 'bold', fontSize: 14 }}
              onClick={() => {
                setShowErrorModal(false);
                currentAudio.pause();
                currentAudio.currentTime = 0;
                setIsPlayingAudio(false);
                setAudioEnded(false);
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ✅ Modal succès code changé */}
      {showSuccessModal && (
        <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', top: 0, left: 0, zIndex: 999 }}>
          <div className="bg-white rounded position-relative text-center"
            style={{ width: '85%', maxWidth: 280, padding: '20px 24px', boxShadow: '0 6px 12px rgba(0,0,0,0.2)' }}>
            {isSuccessAudioPlaying ? (
              <span className="position-absolute" style={{ top: 10, left: 10, fontSize: 20, color: '#03A9F4', animation: 'pulse 1s infinite' }}>
                <i className="fa-solid fa-volume-high"></i>
              </span>
            ) : successAudioEnded && (
              <button
                onClick={() => {
                  successAudio.currentTime = 0;
                  successAudio.play();
                  setIsSuccessAudioPlaying(true);
                  setSuccessAudioEnded(false);
                }}
                className="position-absolute"
                style={{ top: 10, left: 10, background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}
              >
                <i className="fa-solid fa-circle-play"></i>
              </button>
            )}
            <img src="/images/success.png" alt="Succès" style={{ width: 80, height: 80, marginBottom: 16 }} />
            <h6 className="fw-bold mb-2" style={{ fontSize: 16, color: '#333' }}>Code modifié</h6>
            <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
              Votre code secret a été changé avec succès.
            </p>
            <button
              className="btn"
              style={{ backgroundColor: '#03A9F4', color: 'white', borderRadius: 20, padding: '6px 24px', fontWeight: 'bold', fontSize: 14 }}
              onClick={() => {
                setShowSuccessModal(false);
                successAudio.pause();
                successAudio.currentTime = 0;
                setIsSuccessAudioPlaying(false);
                setSuccessAudioEnded(false);
                onSuccess?.();
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetNewPinScreen;
