import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../utils/UserContext';
import { format } from 'date-fns';

const UnlockPinScreen = ({ onSubmit, onForgot }) => {
  const [pin, setPin] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [shake, setShake] = useState(false); // ← nouveau

  const { selectedUser, updateUser } = useUserContext();
  const isBlocked = selectedUser.restrictions?.some(r => r.help === 'loginPinAttemptsExceeded');
  const attempts = selectedUser.unlockAttempts ?? 0;

  const handleInput = (digit) => {
    if (pin.length < 4) setPin(prev => prev + digit);
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const playAudio = (src) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    const newAudio = new Audio(src);
    setCurrentAudio(newAudio);
    newAudio.play();
    setIsPlayingAudio(true);
    setAudioEnded(false);
    newAudio.onended = () => {
      setIsPlayingAudio(false);
      setAudioEnded(true);
    };
  };

  const now = new Date();
  const newErrorLog = (msg) => ({
    date: format(now, 'dd/MM/yyyy, HH:mm'),
    createdAt: now.getTime(), // timestamp en ms
    app: 'User',
    error: msg
  });

  useEffect(() => {
    if (pin.length !== 4) return;

    if (isBlocked) {
      setErrorMessage('Votre compte est bloqué. Veuillez contacter le 200600.');
      setShowErrorModal(true);
      playAudio('/audios/compte-bloque.mp3');
      setPin('');
      return;
    }

    if (pin === selectedUser.codePin) {
      updateUser(selectedUser.id, { unlockAttempts: 0 });
      onSubmit?.();
      return;
    }

    const newAttempts = attempts + 1;
    const showModal = newAttempts >= 4;
    const isFinalAttempt = newAttempts === 6;
    const shouldLog = newAttempts >= 4;

    // Vibration pour les tentatives silencieuses
    if (newAttempts < 4) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }

    const logs = shouldLog
      ? [
          ...(selectedUser.errorLogs || []),
          newErrorLog(
            isFinalAttempt
              ? 'Le client a échoué 6 fois à entrer son code PIN, entraînant le blocage du compte.'
              : `Le client a saisi un code erroné lors d'une tentative de déverrouillage de son compte.`
          )
        ]
      : selectedUser.errorLogs || [];

    const updates = {
      unlockAttempts: newAttempts,
      errorLogs: logs
    };

    if (isFinalAttempt) {
      const alreadyBlocked = selectedUser.restrictions?.some(r => r.help === 'loginPinAttemptsExceeded');
      if (!alreadyBlocked) {
        updates.restrictions = [
          ...(selectedUser.restrictions || []),
          {
            title: 'Login PIN attempts exceeded',
            icon: '🔒',
            reason: 'Too many incorrect PIN entries',
            since: format(new Date(), "MMM d, yyyy HH:mm 'UTC'"),
            color: 'bg-warning text-black',
            help: 'loginPinAttemptsExceeded',
            actions: ['Overide']
          }
        ];
      }
    }

    updateUser(selectedUser.id, updates);

    if (showModal) {
      const remaining = 6 - newAttempts;
      setErrorMessage(
        isFinalAttempt
          ? 'Votre compte a été bloqué, veuillez contacter le 200600.'
          : `Il vous reste ${remaining} tentative${remaining === 1 ? '' : 's'}.\nSi vous avez oublié votre code secret, veuillez contacter le 200600.`
      );
      playAudio(isFinalAttempt ? '/audios/compte-bloque.mp3' : '/audios/tentative-echouee.mp3');
      setShowErrorModal(true);
    }

    setPin('');
  }, [pin]);

  const renderKeypad = () => {
    const layout = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['FORGOT?', '0', '⌫']
    ];

    return layout.map((row, rowIndex) => (
      <div key={rowIndex} className="d-flex justify-content-center mb-2 gap-5">
        {row.map((digit, index) => {
          if (digit === 'FORGOT?') {
            return (
              <button
                key={index}
                onClick={onForgot}
                className="btn"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#333',
                  background: 'transparent',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                Oublié?
              </button>
            );
          }

          return (
            <button
              key={index}
              onClick={() => digit === '⌫' ? handleBackspace() : handleInput(digit)}
              className="btn btn-light"
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                fontSize: 20,
                border: '1px solid #ddd',
                backgroundColor: '#fafafa'
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
    <div className="d-flex flex-column justify-content-between h-100 w-100 px-3 pt-5 pb-4 bg-white text-dark text-center">
      <img src="/images/logo-app.png" alt="Mascotte" style={{ width: 70, margin: '0 auto' }} />

      <div>
        <div className={`d-flex justify-content-center gap-3 mt-5 mb-3 ${shake ? 'shake' : ''}`}>
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
        <p style={{ fontSize: 13 }}>Votre code secret est requis pour déverrouiller</p>
      </div>

      <div>{renderKeypad()}</div>

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
              <span
                className="position-absolute"
                style={{ top: 10, left: 10, fontSize: 20, color: '#03A9F4', animation: 'pulse 1s infinite' }}
              >
                <i className="fa-solid fa-volume-high"></i>
              </span>
            ) : audioEnded && (
              <button
                onClick={() => {
                  if (currentAudio) {
                    currentAudio.play();
                    setIsPlayingAudio(true);
                    setAudioEnded(false);
                  }
                }}
                className="position-absolute"
                style={{ top: 10, left: 10, background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}
              >
                <i className="fa-solid fa-circle-play"></i>
              </button>
            )}

            <img
              src={isBlocked || attempts >= 6 ? '/images/compte-bloque.png' : '/images/tentative-echouee.png'}
              alt="Erreur"
              style={{ width: 80, height: 80, marginBottom: 16 }}
            />
            <h6 className="fw-bold mb-2" style={{ fontSize: 16, color: '#333' }}>
              {isBlocked || attempts >= 6 ? 'Compte bloqué' : 'Code incorrect'}
            </h6>
            <p style={{ fontSize: 14, color: '#555', whiteSpace: 'pre-line', marginBottom: 16 }}>{errorMessage}</p>
            <button
              className="btn"
              style={{ backgroundColor: '#03A9F4', color: 'white', borderRadius: 20, padding: '6px 24px', fontWeight: 'bold', fontSize: 14 }}
              onClick={() => {
                setShowErrorModal(false);
                currentAudio?.pause();
                setCurrentAudio(null);
                setIsPlayingAudio(false);
                setAudioEnded(false);
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

export default UnlockPinScreen;
