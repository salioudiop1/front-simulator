import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import DormancyUnblockModal from '../DormancyUnblockModal';
import { useUserContext } from '../../utils/UserContext';

const BlockBanners = ({ blocks: initialBlocks = [], onUpdateBlockReason }) => {
  const [blocks, setBlocks] = useState([]);
  const [expandedBlockId, setExpandedBlockId] = useState(null);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [unblockReason, setUnblockReason] = useState('');
  const [editModal, setEditModal] = useState({ show: false, reason: '', index: null });
  const [showDormancyUnblockModal, setShowDormancyUnblockModal] = useState(false);

  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [questionStates, setQuestionStates] = useState([]);
  const [showSecuritySuccess, setShowSecuritySuccess] = useState(false);
  const [clearDone, setClearDone] = useState(false);
  const [showVerificationFailedModal, setShowVerificationFailedModal] = useState(false);

  const { selectedUser, setSelectedUser } = useUserContext();

  useEffect(() => {
    setBlocks([...initialBlocks]);
  }, [initialBlocks]);

  if (!initialBlocks || initialBlocks.length === 0) return null;

  const toggleBlockExpand = (id) => {
    setExpandedBlockId(prev => (prev === id ? null : id));
  };

  const handleRequestUnblock = (block) => {
    setUnblockReason('');
    setShowUnblockModal(true);
  };

  const confirmRequestUnblock = (e) => {
    e.preventDefault();
    setShowUnblockModal(false);
  };

  const openEditReasonModal = (index, reason) => {
    setEditModal({ show: true, reason, index });
  };

  const confirmEditReason = (e) => {
    e.preventDefault();
    if (onUpdateBlockReason && editModal.index !== null) {
      onUpdateBlockReason(editModal.index, editModal.reason);
    }
    setEditModal({ show: false, reason: '', index: null });
  };

  const generateSecurityQuestions = () => {
    const questions = [];

    const depositOrWithdrawals = selectedUser.transactions?.filter(t => t.type === 'deposit' || t.type === 'withdrawal') || [];
    const recentTransactions = depositOrWithdrawals.slice(0, 3);
    if (recentTransactions.length > 0) {
      const values = recentTransactions.map(t => {
        const label = t.type === 'withdrawal' ? 'Retrait' : 'Dépôt';
        return `${label} de ${t.amount}F à ${t.location || t.agentAdress || 'lieu inconnu'}`;
      });
      questions.push({
        id: 'last-transactions',
        label: 'Quel est le montant et le lieu du dernier dépôt ou retrait ?',
        values
      });
    }

    if (selectedUser.kyc2 && selectedUser.dob) {
      questions.push({
        id: 'dob',
        label: 'Quelle est la date de naissance du client ?',
        values: [selectedUser.dob],
      });
    }

    const frequentContact = selectedUser.transactions?.find(t => t.type === 'transfer');
    if (!selectedUser.kyc2 && frequentContact) {
      questions.push({
        id: 'contact',
        label: 'Quel est le prénom et le nom d’un contact fréquent ?',
        values: [frequentContact.to || frequentContact.recipient],
      });
    }

    return questions.slice(0, 2);
  };

  const correctCount = questionStates.filter(v => v === true).length;
  const incorrectCount = questionStates.filter(v => v === false).length;
  const dynamicVisibleCount = Math.min(3 + incorrectCount, securityQuestions.length);
  const visibleQuestionStates = questionStates.slice(0, dynamicVisibleCount);
  const allAnswered = visibleQuestionStates.every(v => v !== null);

  const handleSecurityValidation = () => {
    if (correctCount >= 2) {
      setShowSecurityModal(false);
      setTimeout(() => setShowSecuritySuccess(true), 300);
    } else {
      setShowSecurityModal(false);
      setTimeout(() => setShowVerificationFailedModal(true), 300);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center gap-2 mb-3">
      {blocks.map((block, idx) => (
        <div
          key={idx}
          className={`p-2 rounded ${block.color}`}
          style={{ width: '100%', maxWidth: '680px', cursor: 'pointer' }}
        >
          <div className="d-flex justify-content-between align-items-center" onClick={() => toggleBlockExpand(idx)}>
            <div className="d-flex align-items-center">
              <span className="me-2">{expandedBlockId === idx ? '▼' : '▶'}</span>
              <span className="me-2">{block.icon}</span>
              <span className="fw-bold">{block.title}</span>
            </div>
            <div className="d-flex gap-2">
              {block.actions?.includes('Request to unblock') && (
                <Button size="sm" variant="outline-dark" onClick={(e) => { e.stopPropagation(); handleRequestUnblock(block); }}>
                  Request to unblock
                </Button>
              )}
              {block.actions?.includes('Edit reason') && (
                <Button size="sm" variant="outline-dark" onClick={(e) => { e.stopPropagation(); openEditReasonModal(idx, block.reason); }}>
                  Edit reason
                </Button>
              )}
              {block.actions?.includes('Unblock') && block.title === 'Dormancy Block' && (
                <Button size="sm" variant="outline-dark" onClick={(e) => { e.stopPropagation(); setShowDormancyUnblockModal(true); }}>
                  Unblock
                </Button>
              )}
              {block.actions?.includes('Clear') && block.title === 'Security Challenge' && (
                <Button
                  size="sm"
                  variant="outline-dark"
                  onClick={(e) => {
                    e.stopPropagation();
                    const qs = generateSecurityQuestions();
                    setSecurityQuestions(qs);
                    setQuestionStates(Array(qs.length).fill(null));
                    setShowSecurityModal(true);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          {expandedBlockId === idx && (
            <div className="mt-2 small">
              <div><strong>Reason:</strong> {block.reason}</div>
              <div><strong>Blocked by:</strong> {block.blockedBy}</div>
              <div><strong>Since:</strong> {block.since}</div>
            </div>
          )}
        </div>
      ))}

      <Modal show={showSecurityModal} onHide={() => setShowSecurityModal(false)} dialogClassName="modal-lg">
        <Modal.Header closeButton>
          <Modal.Title>🔐 Vérification d'identité pour le Security Challenge</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {securityQuestions
            .slice(0, dynamicVisibleCount)
            .map((q, i) => {
              const realIndex = securityQuestions.findIndex(qt => qt.id === q.id);
              return (
                <div key={q.id} className="border-bottom pb-3 mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-2">{q.label}</h6>
                      <ul className="mb-0">
                        {q.values.map((val, idx) => <li key={idx}>{val}</li>)}
                      </ul>
                    </div>
                    <div className="d-flex flex-column gap-2 align-items-end ms-3" style={{ minWidth: '140px' }}>
                      <Button
                        size="sm"
                        variant={questionStates[realIndex] === true ? 'success' : 'outline-success'}
                        className="w-100 py-2"
                        onClick={() => {
                          const updated = [...questionStates];
                          updated[realIndex] = true;
                          setQuestionStates(updated);
                        }}>
                        ✔ Oui, correct
                      </Button>
                      <Button
                        size="sm"
                        variant={questionStates[realIndex] === false ? 'danger' : 'outline-danger'}
                        className="w-100 py-2"
                        onClick={() => {
                          const updated = [...questionStates];
                          updated[realIndex] = false;
                          setQuestionStates(updated);
                        }}>
                        ✘ Non, incorrect
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="primary"
              disabled={!allAnswered}
              onClick={handleSecurityValidation}>
              Valider l'identité
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showSecuritySuccess} onHide={() => setShowSecuritySuccess(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Confirmation Clear Security Challenge</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-end">
          {clearDone ? (
            <Alert variant="success" className="text-start">
              Le blocage Security Challenge a été levé avec succès.
            </Alert>
          ) : (
            <Button variant="primary" onClick={() => {
              setClearDone(true);
              const updatedBlocks = blocks.filter(b => b.title !== 'Security Challenge');
              setBlocks(updatedBlocks);
              setSelectedUser(prev => ({
                ...prev,
                restrictions: prev.restrictions.filter(b => b.title !== 'Security Challenge'),
              }));
            }}>
              Confirmer le Clear
            </Button>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showUnblockModal} onHide={() => setShowUnblockModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton><Modal.Title>Request to Unblock</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={confirmRequestUnblock}>
            <Form.Group>
              <Form.Label>Reason</Form.Label>
              <Form.Control value={unblockReason} onChange={(e) => setUnblockReason(e.target.value)} required />
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button type="submit" variant="primary">Submit Request</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={editModal.show} onHide={() => setEditModal({ show: false, reason: '', index: null })} dialogClassName="modal-top">
        <Modal.Header closeButton><Modal.Title>Edit Block Reason</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={confirmEditReason}>
            <Form.Group>
              <Form.Label>New Reason</Form.Label>
              <Form.Control value={editModal.reason} onChange={(e) => setEditModal(prev => ({ ...prev, reason: e.target.value }))} required />
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button type="submit" variant="primary">Update</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showVerificationFailedModal} onHide={() => setShowVerificationFailedModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Vérification échouée</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Le client n’a pas réussi à valider son identité. Merci de lui demander de vérifier ses informations et de rappeler plus tard.
          </p>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-end">
          <Button variant="primary" onClick={() => setShowVerificationFailedModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      <DormancyUnblockModal
        show={showDormancyUnblockModal}
        onClose={(wasUnblocked) => {
          setShowDormancyUnblockModal(false);
          if (wasUnblocked) {
            const updatedUser = { ...selectedUser, restrictions: [] };
            setSelectedUser(updatedUser);
            setBlocks([]);
          }
        }}
        user={selectedUser}
        onUnblock={() => {}}
        onRecoverPin={() => {}}
      />
    </div>
  );
};

export default BlockBanners;
