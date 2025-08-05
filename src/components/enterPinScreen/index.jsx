import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../utils/UserContext';
import { format } from 'date-fns';

const EnterPinScreen = ({ onSubmit, onBack }) => {
  const [pin, setPin] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

  const { selectedUser, updateUser } = useUserContext();

  const isBlocked = selectedUser.restrictions?.some(r => r.help === 'loginPinAttemptsExceeded');
  const attemptsLeft = selectedUser.attemptsLeft ?? 3;

  const handleInput = (digit) => {
    if (pin.length < 4) setPin((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
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

  useEffect(() => {
    if (pin.length === 4) {
      if (selectedUser.recovery) {
        onSubmit?.('set-new-pin'); // ou toute autre logique pour afficher SetNewPinScreen
        return;
      }

      const now = new Date();

      const newErrorLog = (msg) => ({
        date: format(now, 'dd/MM/yyyy, HH:mm'),
        createdAt: now.getTime(), // timestamp en ms
        app: 'User',
        error: msg
      });

      if (isBlocked) {
        setErrorMessage('Votre compte a été bloqué, veuillez contacter le 200600.');
        setShowErrorModal(true);
        playAudio('/audios/compte-bloque.mp3');
        setPin('');
        return;
      }

      if (pin === selectedUser.codePin) {
        onSubmit?.();
      } else {
        const remaining = attemptsLeft - 1;

        if (remaining <= 0) {
          const restrictionAlreadyExists = selectedUser.restrictions?.some(
            r => r.help === 'loginPinAttemptsExceeded'
          );

          const updates = {
            attemptsLeft: 0,
            errorLogs: [
              ...(selectedUser.errorLogs || []),
              newErrorLog('Le client a saisi un code secret incorrect à trois reprises, ce qui a entraîné le blocage de son compte.')
            ]
          };

          if (!restrictionAlreadyExists) {
            const newRestriction = {
              title: 'Login PIN attempts exceeded',
              icon: '🔒',
              reason: 'Too many incorrect PIN entries',
              since: format(new Date(), "MMM d, yyyy HH:mm 'UTC'"),
              color: 'bg-warning text-black',
              help: 'loginPinAttemptsExceeded',
              actions: ['Overide']
            };
            updates.restrictions = [...(selectedUser.restrictions || []), newRestriction];
          }

          updateUser(selectedUser.id, updates);
          setErrorMessage('Votre compte a été bloqué, veuillez contacter le 200600.');
          playAudio('/audios/compte-bloque.mp3');
        } else {
          updateUser(selectedUser.id, {
            attemptsLeft: remaining,
            errorLogs: [
              ...(selectedUser.errorLogs || []),
              newErrorLog(`Le client a saisi un code secret incorrect. ${remaining} tentative${remaining === 1 ? '' : 's'} restante${remaining > 1 ? 's' : ''}.`)
            ]
          });
          setErrorMessage(
            `Il vous reste ${remaining} tentative${remaining === 1 ? '' : 's'}.\nSi vous avez oublié votre code secret, veuillez contacter le 200600 pour le réinitialiser.`
          );
          playAudio('/audios/tentative-echouee.mp3');
        }

        setShowErrorModal(true);
        setPin('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const renderKeypad = () => {
    const layout = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['Oublié ?', '0', '⌫']
    ];

    return layout.map((row, rowIndex) => (
      <div key={rowIndex} className="d-flex justify-content-center mb-2 gap-5">
        {row.map((digit, index) => {
          if (digit === 'Oublié ?') {
            return (
              <button
                key={index}
                onClick={() => alert('TODO: récupération du code oublié')}
                className="btn"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#333',
                  background: 'transparent',
                  border: 'none',
                  padding: 0
                }}
              >
                <div style={{ width: 64, fontWeight: 'bold', textAlign: 'center' }}>Oublié ?</div>
              </button>
            );
          }

          return (
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
          );
        })}
      </div>
    ));
  };

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
          Entrez votre code secret pour le compte {selectedUser.phone}
        </p>
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
      </div>

      <div className="text-center">{renderKeypad()}</div>

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
                style={{
                  top: 10,
                  left: 10,
                  fontSize: 20,
                  color: '#03A9F4',
                  animation: 'pulse 1s infinite'
                }}
              >
                <i className="fa-solid fa-volume-high"></i>
              </span>
            ) : audioEnded && (
              <button
                onClick={() => currentAudio?.play()}
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
                <i className="fa-solid fa-circle-play"></i>
              </button>
            )}

            <img
              src={isBlocked ? '/images/compte-bloque.png' : '/images/tentative-echouee.png'}
              alt="Erreur"
              style={{ width: 80, height: 80, marginBottom: 16 }}
            />
            <h6 className="fw-bold mb-2" style={{ fontSize: 16, color: '#333' }}>
              {isBlocked ? 'Compte bloqué' : 'Code incorrect'}
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

export default EnterPinScreen;
