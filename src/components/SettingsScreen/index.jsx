import React, { useState } from 'react';

const Section = ({ title, children }) => (
  <>
    <div className="text-muted text-uppercase mb-2 mt-4" style={{ fontSize: 12 }}>{title}</div>
    <div className="bg-white rounded-3 shadow-sm">
      {children}
    </div>
  </>
);

const SettingsScreen = ({ onBack, phone, onLogout }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="p-3" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex align-items-center mb-3">
        <button className="btn btn-link p-0 me-2" onClick={onBack}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 24, color: 'black' }}></i>
        </button>
        <h5 className="m-0 ms-2">Paramètres</h5>
      </div>

      {/* Sections Paramètres */}
      <Section title="Compte">
        <div className="p-3 border-bottom d-flex align-items-center disabled-option">
          <i className="fa-solid fa-wallet me-3" style={{ width: '20px' }}></i>
          Ajouter un autre compte
        </div>
      </Section>

      <Section title="Partager">
        <div className="p-3 border-bottom d-flex align-items-center disabled-option">
          <i className="fa-solid fa-share-nodes me-3" style={{ width: '20px' }}></i>
          Inviter un ami à rejoindre Wave
        </div>
        <div className="p-3 d-flex align-items-center disabled-option">
          <i className="fa-solid fa-wand-magic-sparkles me-3" style={{ width: '20px' }}></i>
          Utiliser le code promotionnel
        </div>
      </Section>

      <Section title="Support">
        <div className="p-3 border-bottom d-flex align-items-center disabled-option">
          <i className="fa-solid fa-phone me-3" style={{ width: '20px' }}></i>
          Contactez le service client
        </div>
        <div className="p-3 border-bottom d-flex align-items-center disabled-option">
          <i className="fa-solid fa-clipboard-list me-3" style={{ width: '20px' }}></i>
          Vérifiez votre plafond
        </div>
        <div className="p-3 d-flex align-items-center disabled-option">
          <i className="fa-solid fa-location-dot me-3" style={{ width: '20px' }}></i>
          Trouvez les agents à proximité
        </div>
      </Section>

      <Section title="Sécurité">
        <div className="p-3 border-bottom d-flex align-items-center disabled-option">
          <i className="fa-solid fa-mobile-screen-button me-3" style={{ width: '20px' }}></i>
          Vos appareils connectés
        </div>
        <div className="p-3 d-flex align-items-center disabled-option">
          <i className="fa-solid fa-shield-halved me-3" style={{ width: '20px' }}></i>
          Modifiez votre code secret
        </div>
      </Section>

      {/* Bouton déconnexion */}
      <div className="bg-white rounded-3 mt-4">
        <div
          className="p-3 d-flex align-items-center"
          style={{ cursor: "pointer" }}
          onClick={() => setShowLogoutModal(true)}
        >
          <i className="fa-solid fa-right-from-bracket me-3" style={{ width: '20px' }}></i>
          <span style={{ fontWeight: '400' }}>Se déconnecter</span>
          <span className="ms-1 text-muted">({phone})</span>
        </div>
      </div>

      {/* Modal de déconnexion */}
      {showLogoutModal && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 1000 }}
        >
          <div
            className="bg-white rounded-3 px-2 py-4"
            style={{
              width: '90%',
              maxWidth: '320px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            <p className="text-center fw-semibold mb-1" style={{ fontSize: 16 }}>
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>
            <div className="d-flex justify-content-center gap-2" style={{ fontSize: '16px' }}>
              <button
                className="btn btn-link text-primary"
                onClick={() => setShowLogoutModal(false)}
                style={{ fontSize: '16px', textDecoration: 'none' }}
              >
                Annuler
              </button>
              <button
                className="btn btn-link text-primary"
                onClick={onLogout}
                style={{ fontSize: '16px', textDecoration: 'none' }}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
