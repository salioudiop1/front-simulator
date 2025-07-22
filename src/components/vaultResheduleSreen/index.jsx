import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../utils/UserContext';

const VaultRescheduleScreen = ({ onBack }) => {
  const { selectedUser, updateUser } = useUserContext();

  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 2);

  const jours = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const mois = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
  ];
  const annees = [today.getFullYear(), today.getFullYear() + 1, today.getFullYear() + 2].map(y => y.toString());

  const [valueGroups, setValueGroups] = useState({
    day: today.getDate().toString(),
    month: mois[today.getMonth()],
    year: today.getFullYear().toString(),
  });

  const [error, setError] = useState('');

  const monthIndex = (short) => mois.findIndex(m => m === short);

  useEffect(() => {
    const { day, month, year } = valueGroups;
    const selectedDate = new Date(parseInt(year), monthIndex(month), parseInt(day));

    if (selectedDate.toDateString() === today.toDateString()) {
      setError("Vous ne pouvez pas définir la nouvelle date de déblocage à aujourd'hui.");
    } else if (selectedDate > maxDate) {
      setError("Vous ne pouvez pas bloquer le coffre plus de 2 ans.");
    } else {
      setError('');
    }
  }, [valueGroups]);

  const handleChange = (field) => (e) => {
    setValueGroups(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleChoose = () => {
    if (!error) {
      const { day, month, year } = valueGroups;
      const selectedDate = new Date(parseInt(year), monthIndex(month), parseInt(day));
  
      const newEntry = {
        lockedOn: selectedUser.vaultLockedOn || selectedUser.vaultHistory?.at(-1)?.lockedOn || new Date().toISOString(),
        plannedUnlock: selectedUser.vaultLockedUntil,
        unlockedEarly: true,
        unlockedOn: new Date().toISOString(),
        amount: selectedUser.vaultBalance
      };
  
      const updatedHistory = [newEntry, ...(selectedUser.vaultHistory || [])];
  
      updateUser(selectedUser.id, {
        vaultLockedUntil: selectedDate.toISOString(),
        modified: true,
        vaultHistory: updatedHistory
      });
  
      onBack();
    }
  };   
  

  return (
    <div className="d-flex flex-column vh-100 p-3">
      {/* En-tête */}
      <div>
        <div className="d-flex align-items-center mb-3">
          <button className="btn btn-link p-0 me-2" onClick={onBack}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 24, color: 'black' }}></i>
          </button>
        </div>
  
        <div className="text-center mb-3">
          <i className="fa-solid fa-vault" style={{ fontSize: 32, color: '#e91e63' }}></i>
        </div>
  
        <h5 className="text-center mb-3">Choisissez la nouvelle date de déblocage</h5>
  
        <div className="d-flex justify-content-center gap-3 mb-4">
          <select className="form-select w-auto" value={valueGroups.day} onChange={handleChange('day')}>
            {jours.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
          <select className="form-select w-auto" value={valueGroups.month} onChange={handleChange('month')}>
            {mois.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="form-select w-auto" value={valueGroups.year} onChange={handleChange('year')}>
            {annees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
  
        {error && (
          <p className="text-muted text-center mb-4" style={{ fontSize: 14 }}>
            {error}
          </p>
        )}
      </div>
  
      {/* Espace flexible */}
      <div className="flex-grow-1"></div>
  
      {/* Bouton bas */}
      <div className="text-center">
        <button
          className="btn fw-bold text-white"
          style={{ backgroundColor: '#00bfff', borderRadius: 30, width: '100%' }}
          onClick={handleChoose}
          disabled={!!error}
        >
          Choisir la date
        </button>
      </div>
    </div>
  );
  
};

export default VaultRescheduleScreen;
