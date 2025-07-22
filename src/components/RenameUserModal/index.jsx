// RenameUserModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { generateSecurityQuestions } from '../../utils/securityQuestions';


const RenameUserModal = ({ show, onClose, user, updateUser }) => {
  const [questions, setQuestions] = useState([]);
  const [questionStates, setQuestionStates] = useState([]);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [renameConfirmed, setRenameConfirmed] = useState(false);
  const [showVerificationFailedModal, setShowVerificationFailedModal] = useState(false);
  const [step, setStep] = useState(1);
  const [reasonType, setReasonType] = useState('');
  const [newName, setNewName] = useState('');
  const [renameReason, setRenameReason] = useState('');

  useEffect(() => {
    if (show) {
      setStep(1);
      setReasonType('');
      resetQuestions(user);
      setRenameConfirmed(false);
      setShowFinalConfirm(false);
      setShowVerificationFailedModal(false);
      setNewName('');
      setRenameReason('');
    }
  }, [show]);

  const handleClose = () => {
    setStep(1);
    setReasonType('');
    setShowFinalConfirm(false);
    setRenameConfirmed(false);
    setShowVerificationFailedModal(false);
    setNewName('');
    setRenameReason('');
    setQuestionStates([]);
    setQuestions([]);
    onClose();
  };

  const resetQuestions = (user) => {
    const qList = generateSecurityQuestions(user);
  setQuestions(qList);
  setQuestionStates(Array(qList.length).fill(null));
};


  const correctCount = questionStates.filter(v => v === true).length;
  const incorrectCount = questionStates.filter(v => v === false).length;
  const dynamicVisibleCount = Math.min(3 + incorrectCount, questions.length);
  const visibleQuestionStates = questionStates.slice(0, dynamicVisibleCount);
  const allAnswered = visibleQuestionStates.every(v => v !== null);

  const handleValidation = () => {
    if (correctCount >= 3) {
      setStep(3);
    } else {
      handleClose();
      setTimeout(() => setShowVerificationFailedModal(true), 300);
    }
  };

  const handleRename = () => {
    updateUser(user.id, { name: newName });
    setRenameConfirmed(true);
  };

  return (
    <>
      {/* Étape 1 : Choix du motif */}
      <Modal show={show && step === 1} onHide={handleClose} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Pourquoi souhaitez-vous changer le nom ({user.name}) ?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Check type="radio" label="Erreur d'orthographe" name="reasonType" id="typo" onChange={() => setReasonType('typo')} checked={reasonType === 'typo'} />
            <Form.Check type="radio" label="Nom différent du titulaire" name="reasonType" id="different" onChange={() => setReasonType('different')} checked={reasonType === 'different'} />
            <div className="d-flex justify-content-end mt-3">
              <Button onClick={() => {
                if (reasonType === 'typo') {
                  setStep(3);
                } else {
                  setStep(2);
                }
              }} disabled={!reasonType}>Continuer</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Étape 2 : Vérification */}
      <Modal show={step === 2} onHide={handleClose} dialogClassName="modal-lg">
        <Modal.Header closeButton>
          <Modal.Title>🔐 Vérification d'identité</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {questions.slice(0, dynamicVisibleCount).map((q, i) => (
            <div key={q.id} className="border-bottom pb-3 mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold mb-2">{q.label}</h6>
                  <ul className="mb-0">{q.values.map((val, idx) => <li key={idx}>{val}</li>)}</ul>
                </div>
                <div className="d-flex flex-column gap-2 align-items-end ms-3" style={{ minWidth: '140px' }}>
                  <Button size="sm" variant={questionStates[i] === true ? 'success' : 'outline-success'} className="w-100 py-2" onClick={() => { const updated = [...questionStates]; updated[i] = true; setQuestionStates(updated); }}>✔ Oui, correct</Button>
                  <Button size="sm" variant={questionStates[i] === false ? 'danger' : 'outline-danger'} className="w-100 py-2" onClick={() => { const updated = [...questionStates]; updated[i] = false; setQuestionStates(updated); }}>✘ Non, incorrect</Button>
                </div>
              </div>
            </div>
          ))}
          <div className="d-flex justify-content-end mt-3">
            <Button variant="primary" disabled={!allAnswered} onClick={handleValidation}>Valider l'identité</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Étape 3 : Rename */}
      <Modal show={step === 3} onHide={handleClose} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Renommer l'utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renameConfirmed ? (
            <Alert variant="success">✅ Changement effectué !</Alert>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nouveau nom</Form.Label>
                <Form.Control type="text" value={newName} onChange={e => setNewName(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Raison du changement</Form.Label>
                <Form.Control type="text" value={renameReason} onChange={e => setRenameReason(e.target.value)} />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button onClick={handleRename} disabled={!newName || !renameReason}>Confirmer</Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal échec */}
      <Modal show={showVerificationFailedModal} onHide={handleClose} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Vérification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            La vérification du client a échoué. Vous pouvez transférer le client vers le back-office pour une
            vérification plus approfondie ou mettre fin à l'appel.
          </p>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="outline-primary" onClick={handleClose}>Fermer</Button>
          <Button variant="primary" onClick={handleClose}>Transférer au Back-Office</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RenameUserModal;
