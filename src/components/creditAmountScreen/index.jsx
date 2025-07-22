import React, { useState } from 'react';
import { useUserContext } from '../../utils/UserContext';

const CreditAmountScreen = ({ onBack, contact, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { selectedUser } = useUserContext();

  const balance = selectedUser.balance;
  const isAmountTooHigh = Number(amount) > balance;
  const isValidAmount = amount && !isNaN(amount) && Number(amount) > 0;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Contenu scrollable */}
      <div className="p-3" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Header */}
        <div className="d-flex align-items-center mb-3">
          <button className="btn btn-link p-0 me-2" onClick={onBack}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 25, color: 'black' }}></i>
          </button>
          <h5 className="m-0 ms-2">Achat crédit</h5>
        </div>

        {/* Contact */}
        <div className="d-flex align-items-center mb-3 border-bottom pb-2">
          <img src={`/images/orange.png`} alt="Logo" width={40} className="me-3" style={{ borderRadius: '100%' }} />
          <div>
            <div style={{ fontWeight: '400' }}>{contact.name}</div>
            <div className="text-muted">{contact.phone}</div>
          </div>
        </div>

        {/* Montant */}
        <div className="form-group mb-2">
          <label style={{ fontSize: 13, color: isAmountTooHigh ? 'red' : '#1dc8ff' }}>
            Montant
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`form-control border-0 border-bottom ${isAmountTooHigh ? 'border-danger' : 'border-primary'}`}
            placeholder="0"
          />
        </div>

        {isAmountTooHigh && (
          <div className="text-danger mt-1" style={{ fontSize: 13 }}>
            Solde insuffisant. Votre solde est {balance}F
          </div>
        )}
      </div>

      {/* Footer fixe */}
      <div
        style={{
          padding: '10px 16px',
          background: '#fff',
          borderTop: '1px solid #eee',
        }}
      >
        <button
          className="btn w-100 text-white"
          disabled={!isValidAmount || isAmountTooHigh}
          onClick={() => setShowConfirmation(true)}
          style={{
            backgroundColor: isValidAmount && !isAmountTooHigh ? '#1dc8ff' : '#9be8ff',
            borderRadius: 30,
            padding: '12px 0',
          }}
        >
          Acheter
        </button>
      </div>

      {/* Overlay + Confirmation Bottom Sheet */}
      {showConfirmation && (
        <>
          {/* Overlay */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            onClick={() => setShowConfirmation(false)}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 5,
              cursor: 'pointer',
            }}
          />

          {/* Bottom Sheet */}
          <div
            className="position-absolute bottom-0 start-0 end-0 bg-white p-4"
            style={{
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              boxShadow: '0 -2px 10px rgba(0,0,0,0.15)',
              zIndex: 10,
            }}
          >
            <div className="text-end mb-2">
              <button
                className="btn btn-link text-muted p-0"
                onClick={() => setShowConfirmation(false)}
              >
                <i className="fa-solid fa-xmark fa-lg"></i>
              </button>
            </div>

            <div className="text-center px-3 pb-2">
              <img src="/images/logo-app.png" alt="mascotte" style={{ height: 60, marginBottom: 16 }} />
              <h6 className="fw-bold mb-2">Confirmer l’achat de crédit</h6>
              <p className="text-muted small mb-4">
                Vous êtes sur le point d’envoyer <strong>{amount}F</strong> à <strong>{contact.name}</strong>
              </p>
            </div>

            <div className="px-2">
              <button
                className="btn text-white fw-bold w-100"
                style={{
                  backgroundColor: '#00bfff',
                  borderRadius: 25,
                  padding: '12px',
                }}
                onClick={() => {
                  onSubmit(amount);
                  setShowConfirmation(false);
                }}
              >
                Confirmer l’achat
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreditAmountScreen;
