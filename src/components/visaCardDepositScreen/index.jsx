import React, { useState } from 'react';
import { useUserContext } from '../../utils/UserContext';
import { Button, Form } from 'react-bootstrap';

const VisaCardDepositScreen = ({ onBack }) => {
  const { selectedUser, updateUser } = useUserContext();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const waveBalance = selectedUser?.balance || 0;
  const card = selectedUser?.virtualVisaCard;
  const isValid = amount && parseInt(amount) > 0 && parseInt(amount) <= waveBalance;

  const handleDeposit = () => {
    const numericAmount = parseInt(amount);
  
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return setError("Veuillez entrer un montant valide.");
    }
  
    if (numericAmount > waveBalance) {
      return setError("Fonds insuffisants sur le compte Wave.");
    }
  
    const now = new Date().toISOString();
  
    const newTransaction = {
      id: 'TX' + Date.now(),
      type: 'transferToPaymentCardWalletEntry',
      amount: -numericAmount,
      date: now,
      balance: waveBalance - numericAmount,
    };
  
    const updatedUser = {
      ...selectedUser,
      balance: waveBalance - numericAmount,
      transactions: [newTransaction, ...(selectedUser.transactions || [])],
      virtualVisaCard: {
        ...card,
        balance: (card.balance || 0) + numericAmount,
        history: [
          {
            ...newTransaction,
            amount: numericAmount, // positif dans l'historique carte
          },
          ...(card.history || [])
        ]
      }
    };
  
    updateUser(selectedUser.id, updatedUser);
    setShowConfirmation(false);
    onBack();
  };
  

  return (
    <div className="d-flex flex-column" style={{ height: '100vh' }}>
      {/* Contenu principal */}
      <div className="p-3" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Header */}
        <div className="d-flex align-items-center mb-3">
          <button className="btn btn-link p-0 me-2" onClick={onBack}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 24, color: 'black' }}></i>
          </button>
          <h6 className="mb-0 fw-bold">Recharger votre carte</h6>
        </div>

        {/* Carte visuelle */}
        <div className="d-flex align-items-center mb-4">
          <div className="rounded p-2 me-3" style={{ backgroundColor: '#f4e9fd', width: 50, height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <i className="fa-solid fa-credit-card" style={{ color: '#8000ff', fontSize: 20 }}></i>
          </div>
          <div>
            <div className="fw-bold">Carte virtuelle</div>
          </div>
        </div>

        <Form.Group className="mb-3">
          <Form.Label style={{ color: '#00bff3' }}>Montant</Form.Label>
          <Form.Control
            type="number"
            placeholder="Entrez le montant"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
          />
          <Form.Text muted>Solde Wave: {waveBalance.toLocaleString()}F</Form.Text>
          {error && <div className="text-danger small mt-1">{error}</div>}
        </Form.Group>
      </div>

      {/* Footer */}
      <div className="p-3" style={{ borderTop: '1px solid #eee', backgroundColor: '#fff' }}>
        <Button
          className="w-100 fw-bold text-white"
          style={{
            backgroundColor: isValid ? '#00bff3' : '#c2e9f7',
            border: 'none',
            borderRadius: 30,
            padding: '12px 0'
          }}
          onClick={() => setShowConfirmation(true)}
          disabled={!isValid}
        >
          Recharger
        </Button>
      </div>

      {/* Prompt de confirmation */}
      {showConfirmation && (
        <>
          {/* Overlay */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            onClick={() => setShowConfirmation(false)}
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 10 }}
          />

          {/* Modal */}
          <div
            className="position-absolute bottom-0 start-0 end-0 bg-white p-4 text-center"
            style={{
              zIndex: 11,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              boxShadow: '0 -2px 10px rgba(0,0,0,0.2)'
            }}
          >
            <button
              className="btn position-absolute"
              onClick={() => setShowConfirmation(false)}
              style={{ top: 10, right: 15, fontSize: 20 }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <img src="/images/logo-app.png" alt="mascotte" style={{ height: 60, marginBottom: 10 }} />

            <h6 className="fw-bold mb-2">Confirmer la recharge</h6>
            <p className="text-muted small mb-4">
              Vous êtes sur le point d’ajouter <strong>{parseInt(amount).toLocaleString()}F</strong> à votre carte Visa.
            </p>

            <Button
              className="w-100 fw-bold text-white"
              style={{ backgroundColor: '#00bff3', borderRadius: 30, padding: '10px 0' }}
              onClick={handleDeposit}
            >
              Confirmer la recharge
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default VisaCardDepositScreen;
