// components/FakeNotification.jsx
import React from 'react';

const FakeNotification = ({ message }) => {
  return (
    <div
      className="position-absolute"
      style={{
        top: 19,
        left: 13,
        right: 13,
        zIndex: 9999,
        backgroundColor: '#f0f0f0',
        borderRadius: 16,
        padding: '8px 16px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Avatar + bulle verte */}
      <div className="me-3 position-relative">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#aaa',
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
          }}
        >
          W
        </div>
      </div>

      {/* Texte */}
      <div>
        <div style={{ fontWeight: 'bold', fontSize: 14 }}>Wave SN</div>
        <div style={{ fontSize: 13, color: '#555' }}>{message}</div>
      </div>

      <div className="ms-auto" style={{ fontSize: 12, color: '#999' }}>
        now
      </div>
    </div>
  );
};

export default FakeNotification;
