import React from 'react';

const Section = ({ title, children }) => (
  <>
    <div className="text-muted text-uppercase mb-2 mt-4" style={{ fontSize: 12 }}>{title}</div>
    <div className="bg-white rounded-3 shadow-sm">
      {children}
    </div>
  </>
);

const SettingsScreen = ({ onBack, phone }) => {
  return (
    <div className="p-3">
      {/* Header */}
      <div className="d-flex align-items-center mb-3">
        <button className="btn btn-link p-0 me-2" onClick={onBack}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 24, color: 'black' }}></i>
        </button>
        <h5 className="m-0 ms-2">Paramètres</h5>
      </div>

      <Section title="Compte">
        <div className="p-3 border-bottom d-flex align-items-center">
          <i className="fa-solid fa-wallet me-3" style={{width:'20px'}}></i> Ajouter un autre compte
        </div>
      </Section>

      <Section title="Partager">
        <div className="p-3 border-bottom d-flex align-items-center">
          <i className="fa-solid fa-share-nodes me-3" style={{width:'20px'}}></i> Inviter un ami à rejoindre Wave
        </div>
        <div className="p-3 d-flex align-items-center">
          <i className="fa-solid fa-wand-magic-sparkles me-3" style={{width:'20px'}}></i> Utiliser le code promotionnel
        </div>
      </Section>

      <Section title="Support">
        <div className="p-3 border-bottom d-flex align-items-center">
          <i className="fa-solid fa-phone me-3" style={{width:'20px'}}></i> Contactez le service client
        </div>
        <div className="p-3 border-bottom d-flex align-items-center">
          <i className="fa-solid fa-clipboard-list me-3" style={{width:'20px'}}></i> Vérifiez votre plafond
        </div>
        <div className="p-3 d-flex align-items-center">
          <i className="fa-solid fa-location-dot me-3" style={{width:'20px'}}></i> Trouvez les agents à proximité
        </div>
      </Section>

      <Section title="Sécurité">
        <div className="p-3 border-bottom d-flex align-items-center">
          <i className="fa-solid fa-mobile-screen-button me-3" style={{width:'20px'}}></i> Vos appareils connectés
        </div>
        <div className="p-3 d-flex align-items-center">
          <i className="fa-solid fa-shield-halved me-3" style={{width:'20px'}}></i> Modifiez votre code secret
        </div>
      </Section>

      <div className="bg-white rounded-3 mt-4">
        <div className="p-3 d-flex align-items-center">
          <i className="fa-solid fa-right-from-bracket me-3" style={{width:'20px'}}></i>
          <span style={{fontWeight: '400'}}>Se déconnecter</span> <span className="ms-1 text-muted">({phone})</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
