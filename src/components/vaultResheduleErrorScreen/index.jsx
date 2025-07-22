// 🗓️ VaultRescheduleErrorScreen.jsx
import React from 'react';
import { useUserContext } from '../../utils/UserContext';

const VaultRescheduleErrorScreen = ({ onBack }) => {
  const { selectedUser } = useUserContext();

  const vaultLockedUntil = new Date(selectedUser?.vaultLockedUntil);
  const formattedDate = vaultLockedUntil.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <>
      {/* Overlay sombre */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 10 }}
        onClick={onBack}
      />

      {/* Modal style smartphone */}
      <div
        className="position-absolute start-0 end-0 mx-auto bg-white px-3 pt-3 pb-4"
        style={{
          bottom: 0,
          zIndex: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
          maxWidth: 420
        }}
      >
        {/* Fermeture */}
        <div className="text-end">
          <i
            className="fa-solid fa-xmark"
            style={{ cursor: 'pointer', fontSize: 22 }}
            onClick={onBack}
          />
        </div>

        {/* Illustration */}
        <div className="text-center">
          <img
            src="/images/vault-reschedule-error.png"
            alt="Modification impossible"
            style={{ width: 120 }}
          />
        </div>

        {/* Titre et message */}
        <h5 className="text-center fw-bold mb-2">Désolé, vous ne pouvez plus modifier la date</h5>
        <p className="text-center text-muted mb-4 px-2" style={{ fontSize: 14 }}>
          Vous ne pouvez plus modifier la date de déblocage du coffre jusqu'à son déblocage automatique le <strong>{formattedDate}</strong>.
        </p>

        {/* Bouton OK */}
        <div className="text-center">
          <button
            className="btn fw-bold text-white"
            onClick={onBack}
            style={{ backgroundColor: '#00bfff', borderRadius: 30, width: '100%' }}
          >
            OK
          </button>
        </div>
      </div>
    </>
  );
};

export default VaultRescheduleErrorScreen;
