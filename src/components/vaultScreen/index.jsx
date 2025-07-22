import React, { useState } from 'react';
import { useUserContext } from '../../utils/UserContext';
import VaultLockedModal from '../vaultLockedModal';
import VaultRescheduleErrorScreen from '../vaultResheduleErrorScreen';

const VaultScreen = ({ onBack, onNavigate }) => {
  const { selectedUser } = useUserContext();

  const vaultBalance = selectedUser?.vaultBalance || 0;
  const vaultLocked = selectedUser?.vaultLocked;
  const vaultLockedUntil = selectedUser?.vaultLockedUntil;
  const history = selectedUser?.vaultHistory || [];

  const [showLockedModal, setShowLockedModal] = useState(false);

  const [showRescheduleError, setShowRescheduleError] = useState(false);


  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  function formatAmount(amount) {
    return Number(amount)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }  

  return (
    <div className="p-2">
      {/* Retour */}
      <div className="d-flex align-items-center mb-3">
        <button className="btn btn-link p-0 me-2" onClick={onBack}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 24, color: 'black' }}></i>
        </button>
      </div>

      {/* Icône + Titre */}
      <div className="text-center mb-2">
        <div className="mb-1">
          <i className="fa-solid fa-vault" style={{
            backgroundColor: '#ffc0f0',
            color: '#e91e63',
            fontSize: 20,
            padding: 10,
            borderRadius: '50%',
          }}></i>
        </div>
        <div className="text-uppercase" style={{ fontSize: 13, color: '#666' }}>Coffre</div>
      </div>

      {/* Solde */}
      <div className="text-center fw-bold mb-3" style={{ fontSize: 40, color: '#000' }}>
        {formatAmount(vaultBalance)}<span style={{ fontSize: 20 }}>F</span>
      </div>


        {/* Bloc verrouillage */}
        {vaultLocked && (
            <div
                className="text-danger fw-bold d-flex align-items-center justify-content-center mb-3"
                style={{
                backgroundColor: '#ffe5e5',
                borderRadius: 10,
                padding: '6px',
                fontSize: 14,
                }}
            >
                <i className="fa-solid fa-lock me-2" />
                Coffre bloqué jusqu'au&nbsp;
                {new Date(vaultLockedUntil).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                })}
            </div>
        )}

      {/* Boutons bleu clair */}
      <div className="d-flex justify-content-around mb-4">
        <button
            className="btn text-white w-100 me-2 p-2 fw-bold"
            style={{ backgroundColor: '#00bfff', borderRadius: 20 }}
            onClick={() => onNavigate('vault-save')}
            >
            <i className="fa-solid fa-plus me-2" /> Garder
        </button>
        <button
            className="btn text-white w-100 ms-2 p-2 fw-bold"
            style={{
                backgroundColor: vaultLocked ? '#9be8ff' : '#00bfff',
                borderRadius: 20
            }}
            onClick={() => {
                if (vaultLocked) {
                setShowLockedModal(true); // → affiche le modal si bloqué
                } else {
                onNavigate('vault-withdraw'); // ou toute autre navigation vers le retrait
                }
            }}
            >
            <i className="fa-solid fa-minus me-2" /> Récupérer
            </button>

      </div>


      {/* Historique du coffre */}
      {history.length === 0 ? (
        <div className="text-center text-muted">Aucun transfert</div>
      ) : history.map((entry, i) => {
        const isDeposit = entry.amount > 0;
      
        return (
          <div
            key={i}
            className="bg-white rounded shadow-sm p-3 mb-2 d-flex align-items-center"
          >
            {/* Icône + / - */}
            <div
              className="me-3"
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: isDeposit ? '#ffe4f0' : '#eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 16,
                color: '#e91e63'
              }}
            >
              {isDeposit ? '+' : '−'}
            </div>
      
            {/* Texte */}
            <div className="flex-grow-1">
              <div className="fw-bold" style={{ fontSize: 14 }}>
                {isDeposit ? 'Transfert vers coffre' : 'Transfert depuis coffre'}
              </div>
              <div className="text-muted" style={{ fontSize: 13 }}>
                {new Date(entry.date || entry.lockedOn).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
      
            {/* Montant */}
            <div className="fw-bold" style={{ fontSize: 15 }}>
              {isDeposit ? `${formatAmount(entry.amount)}F` : `-${Math.abs(entry.amount)}F`}
            </div>
          </div>
        );
      })}

        {showLockedModal && (
          <VaultLockedModal
            onClose={() => setShowLockedModal(false)}
            onNavigate={(screen) => {
              if (screen === 'vault-reschedule-error') {
                setShowRescheduleError(true);
              } else {
                onNavigate(screen); // pour vault-reschedule
              }
              setShowLockedModal(false);
            }}
            lockedUntil={selectedUser.vaultLockedUntil}
          />
        )}

        {showRescheduleError && (
          <VaultRescheduleErrorScreen onBack={() => setShowRescheduleError(false)} />
        )}

    </div>
  );
};

export default VaultScreen;
