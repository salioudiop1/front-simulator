import React, { useState } from 'react';

const categories = [
  { icon: 'fa-lightbulb', label: 'Factures' },
  { icon: 'fa-utensils', label: 'Restauration' },
  { icon: 'fa-shopping-bag', label: 'Shopping' },
  { icon: 'fa-ellipsis-h', label: 'Autres' }
];

const favorites = [
  { name: 'Canal+', logo: '/logos/canal.jpg', onClick: 'canal' },
  { name: 'Woyofal', logo: '/logos/woyofal.svg', onClick: 'woyofal' }
];

const billers = [
  { name: 'Aquatech', logo: '/logos/aquatech.jpg' },
  { name: 'Baobab+', logo: '/logos/baobab.png' },
  { name: 'Campusen', logo: '/logos/campusen.jpg' },
  { name: 'Senelec', logo: '/logos/senelec.png' },
  { name: 'Sen’eau', logo: '/logos/seneau.png' },
  { name: 'TNT', logo: '/logos/tnt.jpg' },
];

const restaurations = [
  { name: 'Chez Katia', logo: '/logos/gray.avif' },
  { name: 'Piazzola', logo: '/logos/gray.avif' },
  { name: 'Quality Fruit Senegal', logo: '/logos/gray.avif' },
  { name: 'Restaurant Mbecte Mi', logo: '/logos/gray.avif' },
  { name: 'Soprodel', logo: '/logos/gray.avif' }
];

const shoppings = [
  { name: 'Africa Queen', logo: '/logos/gray.avif' },
  { name: 'Bassine Couture', logo: '/logos/gray.avif' },
  { name: 'Coin Afrique', logo: '/logos/gray.avif' },
  { name: 'Discount Africa', logo: '/logos/gray.avif' },
  { name: 'Feemina', logo: '/logos/gray.avif' }
];

const PaymentsScreen = ({ onBack, onSelectBiller }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[^\w\s]/g, "");
  const matches = (item) => normalize(item.name).includes(normalize(searchTerm));

  const renderSection = (title, items) => {
    const seen = new Set();
    const filtered = items.filter(item => {
      const isMatch = matches(item);
      const isNew = !seen.has(item.name);
      if (isMatch && isNew) {
        seen.add(item.name);
        return true;
      }
      return false;
    });

    if (filtered.length === 0) return null;

    return (
      <div key={title} className="mb-3">
        <h6 className="text-muted fw-bold small">{title}</h6>
        {filtered.map((item, i) => (
          <div
            key={i}
            className="d-flex align-items-center py-2"
            style={{ cursor: item.onClick ? 'pointer' : 'default' }}
            onClick={() => {
                if (item.onClick === 'canal') onSelectBiller?.('canal');
                else if (item.onClick === 'woyofal') onSelectBiller?.('woyofal');
            }}
          >
            <img
              src={item.logo}
              alt={item.name}
              style={{ width: 32, height: 32, objectFit: 'contain', marginRight: 10, borderRadius: 5 }}
            />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    );
  };

  const categoryMap = {
    'Factures': billers,
    'Restauration': restaurations,
    'Shopping': shoppings,
    'Autres': []
  };

  return (
    <div className="p-3">
      <div className="d-flex align-items-center mb-3">
        <button className="btn btn-link p-0 me-2" onClick={onBack}>
          <i className="fa fa-arrow-left text-dark fs-5"></i>
        </button>
        <h5 className="m-0">Paiements</h5>
      </div>

      <div className="mb-3 d-flex align-items-center">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Chercher par nom"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ borderRadius: 12, fontSize: 14 }}
        />
        {searchTerm && (
          <button className="btn btn-link text-danger" onClick={() => setSearchTerm('')}>
            Annuler
          </button>
        )}
      </div>

      <div className="d-flex justify-content-between mb-3">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="text-center"
            style={{
              width: 50,
              opacity: selectedCategory && selectedCategory !== cat.label ? 0.3 : 1,
              cursor: 'pointer'
            }}
            onClick={() => setSelectedCategory(cat.label === selectedCategory ? null : cat.label)}
          >
            <i className={`fa ${cat.icon} mb-1`} style={{ fontSize: 20 }}></i>
            <div style={{ fontSize: 10 }}>{cat.label}</div>
          </div>
        ))}
      </div>

      {searchTerm ? (
        <>
          {renderSection("Favoris", favorites)}
          {renderSection("Factures", billers)}
          {renderSection("Restauration", restaurations)}
          {renderSection("Shopping", shoppings)}
        </>
      ) : selectedCategory ? (
        renderSection(selectedCategory, categoryMap[selectedCategory])
      ) : (
        <>
          {renderSection("Favoris", favorites)}
          {renderSection("Factures", billers)}
          {renderSection("Restauration", restaurations)}
          {renderSection("Shopping", shoppings)}
        </>
      )}
    </div>
  );
};

export default PaymentsScreen;
