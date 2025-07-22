// components/TransferAmountScreen.jsx
import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useUserContext } from '../../utils/UserContext';


const TransferAmountScreen = ({ recipient, onBack, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const { updateUser, selectedUser } = useUserContext();

    const balance = selectedUser.balance;
    const isAmountTooHigh = Number(amount) > balance;
    const isValidAmount = amount && !isNaN(amount) && Number(amount) > 0;
    const canSend = isValidAmount && !isAmountTooHigh;

    const calculatedReceived = amount
        ? Math.round(Number(amount) - Math.round(amount) * 0.01)
        : '';

    const [showConfirmation, setShowConfirmation] = useState(false);
    
    const handleConfirm = () => {
        const now = new Date();
        const tx = {
          id: 'TX' + Date.now(),
          type: 'transfer',
          amount: -Number(amount),
          highlight: { name: recipient.name, phone: recipient.phone },
          date: now.toISOString(), // ✅ format universel
          balance: selectedUser.balance - Number(amount)
        };
      
        const recipientTx = {
          ...tx,
          amount: Number(amount) * 0.99,
          highlight: { name: selectedUser.name, phone: selectedUser.phone },
          balance: recipient.balance + Number(amount) * 0.99
        };
      
        updateUser(selectedUser.id, {
          transactions: [tx, ...(selectedUser.transactions || [])],
          balance: selectedUser.balance - Number(amount)
        });
      
        updateUser(recipient.id, {
          transactions: [recipientTx, ...(recipient.transactions || [])],
          balance: recipient.balance + Number(amount) * 0.99
        });
      
        setShowConfirmation(false);
        onBack();
        onSuccess();
      };
      

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Scrollable content */}
          <div className="p-3" style={{ flex: 1, overflowY: 'auto' }}>
            {/* Header */}
            <div className="d-flex align-items-center mb-3">
              <button className="btn btn-link p-0 me-2" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" style={{ fontSize: 25, color: 'black' }}></i>
              </button>
              <h5 className="m-0 ms-2">Envoyer de l’Argent</h5>
            </div>
      
            {/* Infos destinataire */}
            <div className="mb-3">
              <div>À</div>
              <div style={{ color: 'black', fontWeight: '400' }}>{recipient.name}</div>
              <div className="text-muted">{recipient.phone}</div>
            </div>
      
            {/* Montant envoyé */}
            <div className="form-group mb-2">
              <label style={{ fontSize: 13, color: isAmountTooHigh ? 'red' : '#1dc8ff' }}>
                Montant Envoyé
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
              <div className="text-danger mb-3" style={{ fontSize: 13 }}>
                Solde insuffisant. Votre solde est {balance}F
              </div>
            )}
      
            {/* Montant reçu */}
            <div className="form-group mb-4">
              <label style={{ fontSize: 13, color: '#1dc8ff' }}>Montant Reçu</label>
              <input
                type="number"
                value={Math.round(calculatedReceived)}
                readOnly
                className="form-control border-0 border-bottom border-primary text-muted"
                placeholder="0"
              />
            </div>
      
            {/* Infos frais */}
            <div className="text-center mb-4">
              <div style={{ color: '#1dc8ff', fontSize: 13 }}>
                Frais Wave = 1% <br />
                Frais maximum: 5.000F
              </div>
            </div>
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
              disabled={!isValidAmount}
              onClick={() => setShowConfirmation(true)}
              style={{
                backgroundColor: isValidAmount ? '#1dc8ff' : '#9be8ff',
                borderRadius: 50,
                padding: '12px 0',
              }}
            >
              Envoyer
            </button>
          </div>
      
          {/* Modal confirmation (inchangé) */}
          {showConfirmation && (
            <>
              <div
                className="position-absolute top-0 start-0 w-100 h-100"
                onClick={() => setShowConfirmation(false)}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  zIndex: 5,
                  cursor: 'pointer',
                }}
              />
      
              <div
                className="position-absolute bottom-0 start-0 end-0 bg-white p-4"
                style={{
                  borderTopLeftRadius: '20px',
                  borderTopRightRadius: '20px',
                  boxShadow: '0 -2px 10px rgba(0,0,0,0.15)',
                  zIndex: 10,
                }}
              >
                <h5 className="mb-3">Confirmer la Transaction</h5>
      
                <div className="d-flex justify-content-between mb-2">
                  <div className="text-muted">À</div>
                  <div className="text-end">
                    <div>{recipient.name}</div>
                    <div className="text-muted">{recipient.phone}</div>
                  </div>
                </div>
      
                <hr />
      
                <div className="d-flex justify-content-between mb-2">
                  <div className="text-muted">Envoyer</div>
                  <div>{Number(amount)}F</div>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <div className="text-muted">Frais</div>
                  <div>{Math.min(Number(amount) * 0.01, 5000)}F</div>
                </div>
                <div className="d-flex justify-content-between mb-4">
                  <div className="text-muted">Reçu</div>
                  <div>{Math.round(Number(amount) - Number(amount) * 0.01)}F</div>
                </div>
      
                <button
                  className="btn w-100 text-white"
                  onClick={handleConfirm}
                  style={{
                    backgroundColor: '#1dc8ff',
                    borderRadius: 50,
                    padding: '10px 0',
                  }}
                >
                  Confirmer
                </button>
              </div>
            </>
          )}
        </div>
      );      
};

export default TransferAmountScreen;
