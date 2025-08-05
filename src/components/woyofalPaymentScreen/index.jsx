import React, { useState, useRef } from 'react';
import { useUserContext } from '../../utils/UserContext';
import { format } from 'date-fns';

const inputStyle = {
  borderRadius: 0,
  outline: 'none',
  boxShadow: 'none',
  borderColor: '#ccc'
};

const WoyofalPaymentScreen = ({ onBack }) => {
  const [meterNumber, setMeterNumber] = useState('1441-4260-530');
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const errorAudioRef = useRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

  const { selectedUser, updateUser } = useUserContext();

  const formatMeterNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
  };

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

  const handleConfirm = () => {
    const now = new Date();
    
    const logError = {
      date: format(now, 'dd/MM/yyyy, HH:mm'),
      createdAt: now.getTime(), // timestamp en ms
      app: 'Woyofal',
      error: `Erreur achat woyofal : Le service est actuellement indisponible, veuillez réessayer ultérieurement.`
    };

    updateUser?.(selectedUser.id, {
      errorLogs: [...(selectedUser.errorLogs || []), logError]
    });

    setErrorMessage(`Le service est actuellement indisponible, veuillez réessayer ultérieurement.`);
    setShowConfirm(false);
    setShowErrorModal(true);
    playErrorAudio();
  };

  return (
    <div className="d-flex flex-column justify-content-between" style={{ height: '100vh' }}>
      <div className="p-3">
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-link p-0 me-2" onClick={onBack}>
            <i className="fa fa-arrow-left text-dark fs-5"></i>
          </button>
          <h5 className="m-0">Payer</h5>
        </div>

        <div className="d-flex align-items-center mb-4 p-2 border-bottom">
          <img
            src="/logos/woyofal.svg"
            alt="Woyofal"
            style={{ width: 32, height: 32, objectFit: 'contain', marginRight: 10, borderRadius: 5 }}
          />
          <span className="fw-bold text-dark" style={{ fontSize: 16 }}>Woyofal</span>
        </div>

        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control border-0 border-bottom"
            id="meterInput"
            value={meterNumber}
            onChange={(e) => setMeterNumber(formatMeterNumber(e.target.value))}
            placeholder="Numéro de compteur"
            style={inputStyle}
          />
          <label htmlFor="meterInput" className="text-muted">Numéro de compteur</label>
        </div>

        <div className="form-floating mb-2">
          <input
            type="number"
            className="form-control border-0 border-bottom"
            id="amountInput"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Montant"
            style={inputStyle}
          />
          <label htmlFor="amountInput">Montant</label>
        </div>

        <p className="text-center text-info small mt-3">Paiement de facture sans frais !</p>
      </div>

      <div className="p-3 bg-white">
        <button
          className="btn fw-bold"
          onClick={() => setShowConfirm(true)}
          disabled={!meterNumber || !amount}
          style={{
            backgroundColor: '#58D8FD',
            color: 'white',
            borderRadius: 28,
            width: '100%',
            fontSize: 16,
            padding: '12px 0',
            opacity: (!meterNumber || !amount) ? 0.5 : 1
          }}
        >
          Payer
        </button>
      </div>

      {showConfirm && (
        <>
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            onClick={() => setShowConfirm(false)}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 5 }}
          />
          <div
            className="position-absolute bottom-0 start-0 end-0 bg-white pt-4 pb-3 px-4"
            style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30, boxShadow: '0 -2px 10px rgba(0,0,0,0.15)', zIndex: 10 }}
          >
            <div className='mb-3 d-flex justify-content-between'>
              <h6 className="fw-bold">Confirmer le paiement</h6>
              <button className="btn btn-link text-muted p-0" onClick={() => setShowConfirm(false)}>
                <i className="fa-solid fa-xmark fa-lg"></i>
              </button>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Numéro de compteur</span>
              <span className="fw-bold">{meterNumber}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Montant</span>
              <span className="fw-bold">{parseInt(amount).toLocaleString('fr-FR')} F</span>
            </div>
            <button
              className="btn text-white fw-bold w-100"
              style={{ backgroundColor: '#00bfff', borderRadius: 25, padding: '12px' }}
              onClick={handleConfirm}
            >
              Confirmer
            </button>
          </div>
        </>
      )}

      {/* MODAL ERREUR */}
      {showErrorModal && (
        <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          top: 0,
          left: 0,
          zIndex: 999
        }}>
          <div className="bg-white rounded position-relative" style={{
            width: '85%',
            maxWidth: 280,
            padding: '20px 24px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            {isPlayingAudio ? (
              <span className="position-absolute" style={{ top: 10, left: 10, fontSize: 20, color: '#03A9F4', animation: 'pulse 1s infinite' }}>
                <i className="fa-solid fa-volume-high" />
              </span>
            ) : audioEnded && (
              <button onClick={() => playErrorAudio()} className="position-absolute" style={{ top: 10, left: 10, background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}>
                <i className="fa-solid fa-circle-play" />
              </button>
            )}
            <img src="/images/service-indisponible.png" alt="Erreur" style={{ width: 80, height: 80, marginBottom: 16 }} />
            <h6 className="fw-bold mb-2" style={{ fontSize: 16, color: '#333' }}>Service indisponible</h6>
            <p style={{ fontSize: 14, color: '#555', whiteSpace: 'pre-line', marginBottom: 16 }}>{errorMessage}</p>
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

      <audio ref={errorAudioRef} src="/audios/tentative-echouee-woyofal.mp3" preload="auto" />
    </div>
  );
};

export default WoyofalPaymentScreen;
