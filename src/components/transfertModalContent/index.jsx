import React from 'react';
import { useUserContext } from '../../utils/UserContext';

const TransferModalContent = ({ onBack, onSelectRecipient }) => {
  const { users, selectedUser } = useUserContext();

  // Exclure l'utilisateur sélectionné
  const contacts = users.filter(user => user.id !== selectedUser.id);

  return (
    <div className="p-3">
      {/* En-tête */}
      <div className="d-flex align-items-center mb-3">
        <button className="btn btn-link p-0 me-2" onClick={onBack}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 25, color: 'black' }}></i>
        </button>
        <h5 className="m-0 ms-2">Envoyer de l’Argent</h5>
      </div>

      {/* Champ de recherche */}
      <input
        type="text"
        className="form-control mb-3 border-0 border-bottom border-primary"
        placeholder="Entrez un numéro"
      />

      {/* Boutons rapides */}
      <div className="d-flex align-items-center mb-1" style={{cursor: 'pointer'}}>
        <div className="me-2 text-primary" style={{ fontSize: 30 }}>
          <i className="fa-solid fa-plus" style={{ color: '#1dc8ff' }}></i>
        </div>
        <span>Saisir un nouveau numéro</span>
      </div>

      <div className="d-flex align-items-center mb-1" style={{cursor: 'pointer'}}>
        <div className="me-2 text-primary" style={{ fontSize: 30 }}>
          <i className="fa-solid fa-expand" style={{ color: '#1dc8ff' }}></i>
        </div>
        <span>Scanner pour envoyer</span>
      </div>

      {/* Liste de contacts */}
      <h6 className="mt-4">Contacts</h6>
      {contacts.map(contact => (
        <div
            key={contact.id}
            className="d-flex align-items-center my-2"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectRecipient(contact)}
        >
            <div className="me-3 bg-secondary rounded-circle" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32
            }}>
              <i className="fa-solid fa-user" style={{ color: 'white' }}></i>
            </div>
            <div>
              <div style={{fontWeight: '400'}}>{contact.name}</div>
              <div className="text-muted">{contact.phone}</div>
            </div>
        </div>
        ))}
    </div>
  );
};

export default TransferModalContent;
