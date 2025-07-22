import React from 'react';

const VaultEarlyUnlockModal = ({ onCancel, onContact }) => {
  return (
    <>
      {/* Overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 10 }}
        onClick={onCancel}
      />

      {/* Contenu modal */}
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
          <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', fontSize: 22 }} onClick={onCancel} />
        </div>

        <div className="text-center mb-3">
          <img src="/images/penguin-sad.png" alt="Triste" width={100} />
        </div>

        <h6 className="text-center fw-bold mb-2">Êtes-vous sûr de vouloir débloquer votre Coffre tôt ?</h6>
        <p className="text-center text-muted" style={{ fontSize: 14 }}>
          Si vous contactez le service client pour débloquer votre Coffre tôt,
          vous ne pourrez plus le bloquer à nouveau jusqu’au mois prochain.
        </p>

        <div className="d-grid gap-2 mt-4">
          <button
            className="btn fw-bold text-white"
            style={{ backgroundColor: '#00bfff' }}
            onClick={onCancel}
          >
            Garder le coffre bloqué
          </button>

          <button
            className="btn fw-bold text-info border border-info"
            onClick={onContact}
          >
            <i className="fa-brands fa-whatsapp me-2"></i>
            Contactez le service client
          </button>
        </div>
      </div>
    </>
  );
};

export default VaultEarlyUnlockModal;
