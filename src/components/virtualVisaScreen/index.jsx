import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useUserContext } from '../../utils/UserContext';

const VirtualVisaScreen = ({ onBack, onNavigate }) => {
  const { selectedUser, updateUser } = useUserContext();
  const card = selectedUser?.virtualVisaCard;
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLockPrompt, setShowLockPrompt] = useState(false);

  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);

  const [deletedToast, setDeletedToast] = useState(false);

  const handleActivateCard = () => {
    const updatedCard = {
      ...card,
      activated: true,
      balance: 1000,
      history: [],
      blocked: false,
      locked: false,
      deleted: false,
    };
    updateUser(selectedUser.id, { virtualVisaCard: updatedCard });
  };

  const handleCopyCardNumber = () => {
    const number = '1234 5678 9012 ' + (card?.last4 || '1112');
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLockCard = () => {
    const updatedCard = {
      ...card,
      locked: true
    };
    updateUser(selectedUser.id, { virtualVisaCard: updatedCard });
    setShowLockPrompt(false);
  };

  const handleUnlockCard = () => {
    const updatedCard = {
      ...card,
      locked: false
    };
    updateUser(selectedUser.id, { virtualVisaCard: updatedCard });
    setShowUnlockPrompt(false);
  };
  

  function formatAmount(amount) {
    return Number(amount)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }


  const handleDeleteCard = () => {
    const updatedCard = {
      ...card,
      deleted: true,
      activated: false,
      locked: false,
      blocked: false,
    };
  
    const deletedEntry = { ...updatedCard, deletedAt: new Date().toISOString() };
  
    updateUser(selectedUser.id, {
      virtualVisaCard: updatedCard,
      deletedVisaCards: [...(selectedUser.deletedVisaCards || []), deletedEntry]
    });
  
    setShowDeletePrompt(false);
    setDeletedToast(true);
    setTimeout(() => setDeletedToast(false), 3000);
  };  
  

  if (showSettings) {
    return (
      <div className="p-3">
        {/* Retour */}
      <div className="d-flex align-items-center mb-3">
        <button className="btn btn-link p-0 me-2" onClick={() => setShowSettings(false)}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 24, color: 'black' }}></i>
        </button>
        <div style={{ marginLeft: '10px', fontSize: '18px', fontWeight: '500' }}>Paramètres</div>
      </div>
  
        {/* Supprimer la carte */}
        <div
          className="bg-white rounded shadow-sm p-3 d-flex align-items-center"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setShowSettings(false);
            setShowDeletePrompt(true);
          }}
        >
          <i className="fa-solid fa-trash me-3" style={{ fontSize: 18 }}></i>
          <span>Supprimer la carte</span>
        </div>
      </div>
    );
  }
  

  return (
    <div className="p-3" style={{ paddingBottom: 120 }}>
      {/* Retour */}
      <div className="d-flex align-items-center mb-1">
        <button className="btn btn-link p-0 me-2" onClick={onBack}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 24, color: 'black' }}></i>
        </button>
        <div style={{ marginLeft: '10px', fontSize: '18px', fontWeight: '500' }}>Carte</div>
      </div>

      {/* Solde visible en haut */}
      {card?.activated && !card?.locked && (
        <div className="text-center fw-bold mb-2" style={{ fontSize: 40, color: '#000' }}>
          {formatAmount(card?.balance)}<span style={{ fontSize: 20 }}>F</span>
        </div>
      )}


      {card?.activated && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Button
            className="px-4 py-2 fw-bold"
            style={{ backgroundColor: '#00bff3', color: 'white', border: 'none', borderRadius: 20 }}
            onClick={() => onNavigate('visa-deposit')}
          >
            <i className="fa-solid fa-circle-plus me-2"></i> Recharger
          </Button>
          <Button
            className="px-4 py-2 fw-bold"
            style={{ backgroundColor: '#00bff3', color: 'white', border: 'none', borderRadius: 20 }}
            onClick={() => onNavigate('visa-withdraw')}
          >
            <i className="fa-solid fa-circle-minus me-2"></i> Transférer
          </Button>
        </div>
      )}


      {/* Carte visuelle */}
      <div className="position-relative p-3 mb-3 text-white" style={{ backgroundColor: '#00bff3', borderRadius: '16px', opacity: card?.locked || !card.activated? 0.6 : 1 }}>
        {card?.activated && !card?.locked && (
          <i
            className={`fa-solid ${showDetails ? 'fa-eye' : 'fa-eye-slash'}`}
            onClick={() => setShowDetails(!showDetails)}
            style={{ position: 'absolute', top: 10, right: 10, fontSize: 20, cursor: 'pointer', color: 'black' }}
          ></i>
        )}

        <div className="d-flex justify-content-between align-items-start mb-2">
          <img src="/images/logo-app.png" alt="wave" style={{ height: 30 }} />
          <div className="fw-bold me-4">Ecobank</div>
        </div>

        <div className="text-white-50 small">Numéro de la carte</div>
        <div className="fs-5 fw-bold mb-2">
          {card?.activated && !card?.locked
            ? showDetails
              ? '1234 5678 9012 ' + (card?.last4 || '1112')
              : '**** **** **** ' + (card?.last4 || '1112')
            : '**** **** **** ****'}
        </div>

        <div className="d-flex justify-content-between mb-2">
          <div className="text-white">EXP {card?.activated && showDetails ? card?.expiry || '**/**' : '**/**'}</div>
          <div className="text-white">CVV {card?.activated && showDetails ? '123' : '***'}</div>
        </div>

        <div className="text-white">{selectedUser?.name}</div>
        <div className="text-end fw-bold fs-5 mt-2">VISA</div>
      </div>

      {/* Carte non activée */}
      {!card?.activated ? (
        <>
          <div className="bg-light rounded p-3 mb-3 text-center">
            <strong>Activer la carte Visa Virtuelle</strong>
            <p className="small mb-0 mt-2">
              Acheter en ligne avec votre carte Visa Virtuelle avec le solde disponible sur votre compte Wave.
            </p>
          </div>
          <div className="position-absolute bottom-0 start-0 end-0 bg-white px-3 pb-4 pt-2" style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <div className="small text-center mb-2">
              En activant la carte virtuelle, vous acceptez les <a href="#" className="text-decoration-underline">termes et conditions</a> de Wave.
            </div>
            <Button
              onClick={handleActivateCard}
              className="w-100 text-white fw-bold"
              style={{ backgroundColor: '#00bff3', borderRadius: 30 }}
            >
              Activer la carte
            </Button>
          </div>

        </>
      ) : card.locked ? (
        <div
          className="bg-white rounded shadow-sm p-3 d-flex align-items-center mb-3"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowUnlockPrompt(true)}
        >
          <i className="fa-solid fa-lock-open me-3" style={{ fontSize: 20 }}></i>
          <div>
            <div className="fw-bold" style={{ fontSize: '15px' }}>Déverrouiller la carte</div>
            <div className="text-muted small">Appuyer sur pour reprendre la carte</div>
          </div>
        </div>
      ) : (
        <>
          {/* Bloc d’options */}
          <div className="bg-white rounded shadow-sm p-3 mb-3">
            <div className="d-flex align-items-center mb-3" style={{ cursor: 'pointer' }} onClick={handleCopyCardNumber}>
              <i className="fa-solid fa-copy me-2"></i> Copier le numéro de carte
            </div>
            <div className="d-flex align-items-center mb-3" style={{ cursor: 'pointer' }} onClick={() => setShowLockPrompt(true)}>
              <i className="fa-solid fa-lock me-2"></i> Verrouiller carte
            </div>
            <div className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => setShowSettings(true)}>
              <i className="fa-solid fa-gear me-2"></i> Paramètres
            </div>
          </div>

          {/* Historique */}
          <h6>Historique</h6>
          {card.history?.length > 0 ? card.history.map((tx, idx) => {
            let label = '';
            if (tx.type === 'transferToPaymentCardWalletEntry') {
              label = 'Dépôt sur carte';
            } else if (tx.type === 'transferFromPaymentCardWalletEntry') {
              label = 'Retrait vers wallet';
            } else if (tx.type === 'card_payment') {
              label = `Paiement à ${tx.merchant || '---'}`;
            } else {
              label = tx.label || '---';
            }

            const isNegative = tx.amount < 0;
            const formattedAmount = `${isNegative ? '-' : '+'}${Math.abs(tx.amount).toLocaleString()}F`;

            const date = new Date(tx.date);
            const dateStr = date.toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'long', year: 'numeric'
            });
            const timeStr = date.toLocaleTimeString('fr-FR', {
              hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={idx} className="d-flex justify-content-between align-items-start border-bottom py-2">
                <div>
                  <div style={{ fontSize: '15px', color: '#180399', fontWeight: '500' }}>{label}</div>
                  <small className="text-muted" style={{ fontSize: '13px' }}>{dateStr}, {timeStr}</small>
                </div>
                <div style={{ fontSize: '15px', color: '#180399', fontWeight: '500' }}>
                  {formattedAmount}
                </div>
              </div>
            );
          }) : <div className="text-muted text-left" style={{ fontSize: '15px' }}>Aucune transaction</div>}
        </>
      )}

      {/* Toast de copie */}
      {copied && (
        <div
          className="position-fixed start-50 translate-middle-x"
          style={{
            bottom: 30,
            backgroundColor: '#000',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: '500',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          Numéro de carte copié
        </div>
      )}

      {/* Backdrop foncé derrière le prompt */}
      {showLockPrompt && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, borderRadius: '30px' }}
        />
      )}

      {/* Confirmation verrouillage dans l'écran */}
      {showLockPrompt && (
        <div className="position-absolute bottom-0 start-0 end-0 bg-white p-4 shadow-lg" style={{ zIndex: 1000, borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
          <div className="text-end">
            <button className="btn btn-link text-muted p-0 mb-2" onClick={() => setShowLockPrompt(false)}>
              <i className="fa-solid fa-xmark fa-lg"></i>
            </button>
          </div>
          <div className="text-center">
            <img src="/images/logo-app.png" alt="mascotte" style={{ height: 80 }} className="mb-3" />
            <h6 className="fw-bold">Êtes-vous sûr de vouloir verrouiller votre carte&nbsp;?</h6>
            <p className="text-muted small">
              Si vous verrouillez votre carte, elle ne pourra plus être débitée.            
              </p>
              <button
                className="btn fw-bold text-white w-100"
                style={{ backgroundColor: '#00bfff' }}
                onClick={handleLockCard}
              >
                Verrouiller la carte
              </button>
          </div>
        </div>
      )}

      {showUnlockPrompt && (
        <>
          {/* Backdrop */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          />

          {/* Prompt modal */}
          <div
            className="position-absolute bottom-0 start-0 end-0 p-4 pt-5 shadow-lg"
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              zIndex: 1000
            }}
          >
            {/* Bouton de fermeture (X) */}
            <button
              onClick={() => setShowUnlockPrompt(false)}
              className="btn position-absolute"
              style={{ top: 10, right: 15, fontSize: 20 }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="text-center">
              <img src="/images/logo-app.png" alt="mascotte" style={{ height: 80 }} className="mb-3" />
              <h6 className="fw-bold">Déverrouiller votre carte&nbsp;?</h6>
              <p className="text-muted small">Vous pourrez l’utiliser à nouveau immédiatement.</p>
              <Button variant="light" onClick={() => setShowUnlockPrompt(false)} className="w-100 mb-2">
                Annuler
              </Button>
              <Button className="w-100" style={{backgroundColor: '#00bff3'}} onClick={handleUnlockCard}>
                Déverrouiller la carte
              </Button>
            </div>
          </div>
        </>
      )}

      {showDeletePrompt && (
        <>
          {/* Backdrop */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          />

          {/* Modal de suppression */}
          <div
            className="position-absolute bottom-0 start-0 end-0 bg-white p-4 pt-5 shadow-lg"
            style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, zIndex: 1000 }}
          >
            {/* Bouton de fermeture */}
            <button
              className="btn position-absolute"
              onClick={() => setShowDeletePrompt(false)}
              style={{ top: 10, right: 15, fontSize: 20 }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="text-center">
              <img src="/images/logo-app.png" alt="mascotte" style={{ height: 80 }} className="mb-3" />
              <h6 className="fw-bold">Supprimer cette carte&nbsp;?</h6>
              <p className="text-muted small">
                Cette action est irréversible. Vous ne pourrez plus utiliser cette carte.
              </p>
              <Button variant="light" onClick={() => setShowDeletePrompt(false)} className="w-100 mb-2">
                Annuler
              </Button>
              <Button className="w-100 fw-bold text-white" style={{ backgroundColor: '#ff3b30' }} onClick={handleDeleteCard}>
                Supprimer la carte
              </Button>
            </div>
          </div>
        </>
      )}


      {deletedToast && (
        <div
          className="position-fixed start-50 translate-middle-x"
          style={{
            bottom: 30,
            backgroundColor: '#000',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: '500',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          Carte Visa supprimée
        </div>
      )}

    </div>
  );
};

export default VirtualVisaScreen;
