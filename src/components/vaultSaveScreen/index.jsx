import React, { useState } from 'react';
import { useUserContext } from '../../utils/UserContext';

const VaultSaveScreen = ({ onBack }) => {
  const { selectedUser, updateUser } = useUserContext();
  const [amount, setAmount] = useState('');

  const balance = selectedUser?.balance || 0;
  const isValid = amount && !isNaN(amount) && Number(amount) > 0 && Number(amount) <= balance;
  const isTooMuch = Number(amount) > balance;


  const handleSave = () => {
    const now = new Date();
    const iso = now.toISOString();

    // Création transaction + mise à jour coffre
    updateUser(selectedUser.id, {
      balance: balance - Number(amount),
      vaultBalance: (selectedUser.vaultBalance || 0) + Number(amount),
      vaultHistory: [
        {
          date: iso,
          amount: Number(amount)
        },
        ...(selectedUser.vaultHistory || [])
      ],
      transactions: [
        {
          id: 'TX' + Date.now(),
          type: 'transferToVault',
          amount: -Number(amount),
          date: iso,
          balance: balance - Number(amount)
        },
        ...(selectedUser.transactions || [])
      ]
    });

    setAmount('');
    onBack();
  };

  return (
    <div className="d-flex flex-column h-100">
  
      {/* Contenu scrollable */}
      <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
        {/* Header */}
        <div className="d-flex align-items-center mb-3">
          <button className="btn btn-link p-0 me-2" onClick={onBack}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 24, color: 'black' }}></i>
          </button>
          <h5 className="m-0">Garder</h5>
        </div>
  
        {/* Destination */}
        <div className="text-muted" style={{ fontSize: 13 }}>Vers</div>
        <div className="mb-3" style={{ fontSize: 16, fontWeight: '500' }}>Coffre</div>
  
        {/* Montant */}
        <div className="form-group mb-1">
            <label className="fw-bold" style={{ fontSize: 13, color: isTooMuch ? 'red' : '#1dc8ff' }}>
                Montant
            </label>
            <input
                type="number"
                className={`form-control border-0 border-bottom ${isTooMuch ? 'border-danger text-danger' : 'border-info'}`}
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
        </div>

            {/* Message de solde */}
        <div
            className={`mb-4 ${isTooMuch ? 'text-danger' : 'text-muted'}`}
            style={{ fontSize: 13 }}
            >
            Solde compte principal: {balance}F. {isTooMuch && 'Solde insuffisant.'}
        </div>
  
        {/* Message frais */}
        <div className="text-center text-info mb-2" style={{ fontSize: 13 }}>
          Gardez et récupérez sans frais !
        </div>
      </div>
  
      {/* Footer fixe */}
      <div className="p-3" style={{ background: '#fff' }}>
        <button
          className="btn w-100 text-white fw-bold"
          disabled={!isValid}
          onClick={handleSave}
          style={{
            backgroundColor: isValid ? '#00bfff' : '#9be8ff',
            borderRadius: 30,
            padding: '12px 0'
          }}
        >
          Garder
        </button>
      </div>
  
    </div>
  );  
};

export default VaultSaveScreen;
