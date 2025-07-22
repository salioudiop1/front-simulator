import React from 'react';
import { useUserContext } from '../../utils/UserContext';

const CreditScreen = ({ onBack, onSelectContact }) => {
    const { users, selectedUser } = useUserContext();

  // Exclure l'utilisateur sélectionné
  const contacts = users.filter(user => user.id !== selectedUser.id);

  return (
    <div className="p-3">
      {/* Header */}
      <div className="d-flex align-items-center mb-3">
            <button className="btn btn-link p-0 me-2" onClick={onBack}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 25, color: 'black' }}></i>
            </button>
            <h5 className="m-0 ms-2">Achat crédit</h5>
        </div>

      {/* Nouveau numéro */}
      <div className="d-flex align-items-center mb-3" style={{cursor: 'pointer'}}>
        <div className="me-2 text-primary" style={{ fontSize: 30 }}>
          <i className="fa-solid fa-plus" style={{ color: '#1dc8ff' }}></i>
        </div>
        <span>Pour un nouveau numéro</span>
      </div>

      {/* Contacts */}
      <div>
        <h6 className="fw-bold">Contacts</h6>
        {contacts.map((contact, i) => (
            <div
                key={contact.id}
                className="d-flex align-items-center my-2"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectContact(contact)}
            >
                <div className="me-3">
                    <img src="/images/orange.png" alt="" style={{borderRadius: '100%'}} width={32}/>
                </div>
                <div>
                    <div style={{fontWeight: '400'}}>{contact.name}</div>
                    <div className="text-muted">{contact.phone}</div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default CreditScreen;
