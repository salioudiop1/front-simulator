import React, { useState } from 'react';
import { useUserContext } from '../../utils/UserContext';
import VaultEarlyUnlockModal from '../VaultEarlyUnlockModal';


const VaultLockedModal = ({ onClose, lockedUntil, hasChangedVaultUnlockDate, onChangeDate, onNavigate }) => {
  const lockedDateFormatted = new Date(lockedUntil).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleClick = () => {
    if (hasChangedVaultUnlockDate) {
      // → Modal d’erreur : "Vous ne pouvez plus modifier…"
      onChangeDate('alreadyChanged');
    } else {
      // → Ouvre le sélecteur de date (écran capture 1)
      onChangeDate('changeDate');
    }
  };

  const { selectedUser } = useUserContext();
  const [showEarlyModal, setShowEarlyModal] = useState(false);
  


  return (
    <>
      {/* Overlay global */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 10 }}
        onClick={onClose}
      />
  
      {/* Si le 2e modal est actif, on le montre seul */}
      {showEarlyModal ? (
        <VaultEarlyUnlockModal
          onCancel={() => setShowEarlyModal(false)}
          onContact={() => {
            window.open('https://wa.me/221771234567', '_blank');
            setShowEarlyModal(false);
          }}
        />
      ) : (
        <div
          className="position-absolute start-0 end-0 mx-auto bg-white p-4"
          style={{
            bottom: 0,
            zIndex: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="text-end">
            <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', fontSize: 22 }} onClick={onClose} />
          </div>
  
          <div className="text-center mb-1">
            <img src="/images/calendar-logo.png" alt="Coffre verrouillé" width={100} />
          </div>
  
          <h5 className="text-center fw-bold mb-2">Votre Coffre est bloqué</h5>
          <p className="text-center text-muted mb-4" style={{ fontSize: 14 }}>
            Vous ne pouvez pas récupérer d’argent de votre Coffre. Il est bloqué jusqu’au <strong>{lockedDateFormatted}</strong>.
          </p>
  
          <div className="d-grid gap-2">
            <button
              className="btn text-white fw-bold"
              style={{ backgroundColor: '#00bfff' }}
              onClick={() => {
                const hasAlreadyChanged = selectedUser?.modified;
  
                if (hasAlreadyChanged) {
                  onNavigate('vault-reschedule-error');
                } else {
                  onNavigate('vault-reschedule');
                }
  
                onClose();
              }}
            >
              Modifier la date de déblocage
            </button>
  
            <button
              className="btn fw-bold text-primary border border-info"
              onClick={() => setShowEarlyModal(true)}
            >
              Débloquer maintenant
            </button>
          </div>
        </div>
      )}
    </>
  );
  
};

export default VaultLockedModal;
