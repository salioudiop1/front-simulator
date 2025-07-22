import React, { useState, useRef, useEffect } from 'react';
import { useUserContext } from '../../utils/UserContext';

const TopControls = () => {
  const {
    users,
    setSelectedUser,
    goToPreviousUser,
    goToNextUser,
  } = useUserContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)
  );

  const handleSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  return (
    <div
      className="d-flex flex-wrap align-items-center p-2 mb-2 border-bottom bg-light gap-2 position-relative"
      ref={wrapperRef}
    >
      <button
        type="button"
        className="btn btn-outline-success"
        onClick={goToPreviousUser}
      >
        ◀
      </button>

      <div className="flex-grow-1 position-relative">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher un nom ou un numéro..."
          value={searchTerm}
          onClick={() => setShowSuggestions(true)}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
        />
        {showSuggestions && (
          <ul className="list-group position-absolute w-100 z-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <li
                  key={user.id}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSelect(user)}
                  style={{ cursor: 'pointer' }}
                >
                  {user.kyc_name ? user.kyc_name : user.name} ({user.phone})
                </li>
              ))
            ) : (
              <li className="list-group-item text-muted">Aucun résultat</li>
            )}
          </ul>
        )}
      </div>

      <button
        type="button"
        className="btn btn-outline-success"
        onClick={goToNextUser}
      >
        ▶
      </button>

      <button
        type="button"
        className="btn btn-outline-warning"
        onClick={() => setSelectedUser(null)}
      >
        📞
      </button>

      <div className="dropdown">
        <button className="btn btn-outline-info dropdown-toggle" type="button" data-bs-toggle="dropdown" disabled>
          ➡
        </button>
        <ul className="dropdown-menu">
          <li><a className="dropdown-item" href="#">Backoffice</a></li>
          <li><a className="dropdown-item" href="#">Fraud</a></li>
          <li><a className="dropdown-item" href="#">Pulaar</a></li>
        </ul>
      </div>

      <button type="button" className="btn btn-outline-info" disabled>↻</button>

      <div className="dropdown">
        <button className="btn btn-outline-info dropdown-toggle" type="button" data-bs-toggle="dropdown" disabled>
          🇸🇳 Sénégal
        </button>
        <ul className="dropdown-menu">
          <li><a className="dropdown-item" href="#">🇨🇮 Côte d'Ivoire</a></li>
          <li><a className="dropdown-item" href="#">🇺🇬 Uganda</a></li>
          <li><a className="dropdown-item" href="#">🇲🇱 Mali</a></li>
          <li><a className="dropdown-item" href="#">🇧🇫 Burkina Faso</a></li>
          <li><a className="dropdown-item" href="#">🇬🇲 Gambia</a></li>
          <li><a className="dropdown-item" href="#">🇳🇪 Niger</a></li>
          <li><a className="dropdown-item" href="#">🇨🇲 Cameroon</a></li>
          <li><a className="dropdown-item" href="#">🇸🇱 Sierra Leone</a></li>
        </ul>
      </div>

      <div className="dropdown">
        <button className="btn btn-outline-info dropdown-toggle" type="button" data-bs-toggle="dropdown" disabled>
          EN
        </button>
        <ul className="dropdown-menu">
          <li><a className="dropdown-item" href="#">EN</a></li>
          <li><a className="dropdown-item" href="#">FR</a></li>
        </ul>
      </div>

      <div>
        <span style={{
          fontFamily: "'Caveat', cursive",
          fontSize: '1.8rem',
          color: '#333',
          fontWeight: 'bold'
        }}>
          Simulateur
        </span>
      </div>
    </div>
  );
};

export default TopControls;
