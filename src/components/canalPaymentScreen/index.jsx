import React, { useState, useRef } from 'react';
import { useUserContext } from '../../utils/UserContext';
import { format } from 'date-fns';

const plans = [
  { label: 'Access (5.000F)', value: 'access', amount: 5000 },
  { label: 'Évasion (10.000F)', value: 'evasion', amount: 10000 },
  { label: 'Tout Canal (20.000F)', value: 'toutcanal', amount: 20000 },
];

const durations = [
  { label: '1 mois', value: '1m' },
  { label: '2 mois', value: '2m' },
  { label: '3 mois', value: '3m' }
];

const inputStyle = {
  borderRadius: 0,
  outline: 'none',
  boxShadow: 'none',
  borderColor: '#ccc'
};

const CanalPaymentScreen = ({ onBack }) => {
  const [cardNumber, setCardNumber] = useState('11111111111');
  const [plan, setPlan] = useState(plans[0].value);
  const [duration, setDuration] = useState(durations[0].value);
  const [program, setProgram] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

  const errorAudioRef = useRef(null);
  const { selectedUser, updateUser } = useUserContext();

  const selectedPlan = plans.find(p => p.value === plan);
  const selectedDuration = durations.find(d => d.value === duration);
  const total = selectedPlan.amount * parseInt(duration);

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

    const message = `Votre numéro de carte ${cardNumber} est incorrect. Veuillez ressayer ou contacter le service client canal au 201555.`;

    const newError = {
        date: format(now, 'dd/MM/yyyy, HH:mm'),
        createdAt: now.getTime(), // timestamp en ms
      app: 'Canal+',
      error: "Erreur de paiement Canal : le numéro de carte saisi par le client était incorrect."
    };

    updateUser?.(selectedUser.id, {
      errorLogs: [...(selectedUser.errorLogs || []), newError]
    });

    setErrorMessage(message);
    setShowConfirm(false);
    setShowErrorModal(true);
    playErrorAudio();
  };

  return (
    <div className="d-flex flex-column justify-content-between" style={{ height: '100vh' }}>
      <div className="p-3">
        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-link p-0 me-2" onClick={onBack}>
            <i className="fa fa-arrow-left text-dark fs-5"></i>
          </button>
          <h5 className="m-0">Payer</h5>
        </div>

        {/* Logo */}
        <div className="d-flex align-items-center mb-4 p-2 border-bottom">
          <img
            src="/logos/canal.jpg"
            alt="Canal+"
            style={{ width: 32, height: 32, objectFit: 'contain', marginRight: 10, borderRadius: 5 }}
          />
          <span className="fw-bold text-dark" style={{ fontSize: 16 }}>Canal+</span>
        </div>

        {/* Form */}
        <div className="mb-4">
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control border-0 border-bottom"
              id="cardInput"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="Numéro de carte"
              style={inputStyle}
            />
            <label htmlFor="cardInput" className="text-muted">Numéro de carte</label>
          </div>

          <div className="form-floating mb-3">
            <select
              className="form-select border-0 border-bottom"
              id="planSelect"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              style={inputStyle}
            >
              {plans.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <label htmlFor="planSelect" className="text-muted">Plan</label>
          </div>

          <div className="form-floating mb-3">
            <select
              className="form-select border-0 border-bottom"
              id="durationSelect"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={inputStyle}
            >
              {durations.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <label htmlFor="durationSelect" className="text-muted">Durée</label>
          </div>

          <div className="form-floating mb-2">
            <input
              type="text"
              className="form-control border-0 border-bottom"
              id="programInput"
              placeholder="Add program (Optional)"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              style={inputStyle}
            />
            <label htmlFor="programInput" className="text-muted">Add program (Optional)</label>
          </div>

          <p className="text-center text-info small mt-3">Paiement de factures sans frais !</p>
        </div>
      </div>

      {/* Bouton Payer */}
      <div className="p-3 bg-white">
        <button
          className="btn fw-bold"
          onClick={() => setShowConfirm(true)}
          style={{
            backgroundColor: '#58D8FD',
            color: 'white',
            borderRadius: 28,
            width: '100%',
            fontSize: 16,
            padding: '12px 0'
          }}
        >
          Payer
        </button>
      </div>

      {/* MODAL CONFIRMATION */}
      {showConfirm && (
        <>
          <div className="position-absolute top-0 start-0 w-100 h-100" onClick={() => setShowConfirm(false)} style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 5 }} />
          <div className="position-absolute bottom-0 start-0 end-0 bg-white pt-4 pb-3 px-4" style={{
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.15)',
            zIndex: 10,
          }}>
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <h6 className="fw-bold m-0">Confirmer le paiement</h6>
              <button className="btn btn-link text-muted p-0" onClick={() => setShowConfirm(false)}>
                <i className="fa-solid fa-xmark fa-lg" />
              </button>
            </div>

            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Numéro de carte</span><span className="fw-bold">{cardNumber}</span></div>
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Plan</span><span className="fw-bold">{selectedPlan.label}</span></div>
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Durée</span><span className="fw-bold">{selectedDuration.label}</span></div>
            <div className="d-flex justify-content-between mb-3"><span className="text-muted">Total</span><span className="fw-bold">{total.toLocaleString('fr-FR')}F</span></div>

            <button className="btn text-white fw-bold w-100" style={{ backgroundColor: '#00bfff', borderRadius: 25, padding: '12px' }} onClick={handleConfirm}>
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
            <img src="/images/carte-incorrecte.png" alt="Erreur" style={{ width: 80, height: 80, marginBottom: 16 }} />
            <h6 className="fw-bold mb-2" style={{ fontSize: 16, color: '#333' }}>Erreur de carte</h6>
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

      <audio ref={errorAudioRef} src="/audios/tentative-echouee-canal.mp3" preload="auto" />
    </div>
  );
};

export default CanalPaymentScreen;
