import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { generateSecurityQuestions } from '../../utils/securityQuestions';

const ResetPinModalWithVerification = ({ show, onClose, user, onReset }) => {
  const [questions, setQuestions] = useState([]);
  const [questionStates, setQuestionStates] = useState([]);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [showVerificationFailedModal, setShowVerificationFailedModal] = useState(false);
  const [pinSet, setPinSet] = useState(false);
  const [newPin, setNewPin] = useState('');

  const resetQuestions = () => {
    const qList = generateSecurityQuestions(user);
    setQuestions(qList);
    setQuestionStates(Array(qList.length).fill(null));
    setPinSet(false);
    setNewPin('');
  };

  useEffect(() => {
    if (user && show) resetQuestions();
  }, [user, show]);

  const incorrectCount = questionStates.filter(v => v === false).length;
  const correctCount = questionStates.filter(v => v === true).length;
  const visibleCount = Math.min(3 + incorrectCount, questions.length);
  const allVisibleAnswered = questionStates.slice(0, visibleCount).every(v => v !== null);

  const handleValidation = () => {
    onClose(); // Ferme le modal de vérification
    if (correctCount >= 3) {
      setShowFinalConfirm(true);
    } else {
      setShowVerificationFailedModal(true);
    }
  };

  const handleConfirmPin = () => {
    onReset(newPin);
    setPinSet(true);
  };

  const handleCloseAll = () => {
    onClose();
    setShowFinalConfirm(false);
    setShowVerificationFailedModal(false);
    setPinSet(false);
    setNewPin('');
    setQuestions([]);
    setQuestionStates([]);
  };

  return (
    <>
      {/* Vérification */}
      <Modal show={show} onHide={onClose} dialogClassName="modal-lg">
        <Modal.Header closeButton>
          <Modal.Title>🔐 Vérification d'identité pour le Reset PIN</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {questions.slice(0, visibleCount).map((q, i) => (
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
                    variant={questionStates[i] === true ? 'success' : 'outline-success'}
                    className="w-100 py-2"
                    onClick={() => {
                      const updated = [...questionStates];
                      updated[i] = true;
                      setQuestionStates(updated);
                    }}>
                    ✔ Oui, correct
                  </Button>
                  <Button
                    size="sm"
                    variant={questionStates[i] === false ? 'danger' : 'outline-danger'}
                    className="w-100 py-2"
                    onClick={() => {
                      const updated = [...questionStates];
                      updated[i] = false;
                      setQuestionStates(updated);
                    }}>
                    ✘ Non, incorrect
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <div className="d-flex justify-content-end">
            <Button variant="primary" disabled={!allVisibleAnswered} onClick={handleValidation}>
              Valider l'identité
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Saisie PIN */}
      <Modal show={showFinalConfirm} onHide={handleCloseAll} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Définir un nouveau PIN</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pinSet ? (
            <>
                <div className="alert alert-success fade show">
                    <span className="flex-grow">Succès ! Un nouveau code PIN a été défini pour ce client.</span>
                </div>
                <div className="d-flex justify-content-end mt-3">
                    <Button onClick={handleCloseAll}>Fermer</Button>
                </div>
            </>
          ) : (
            <Form onSubmit={(e) => {
              e.preventDefault();
              handleConfirmPin();
            }}>
              <Form.Group>
                <Form.Label>Nouveau PIN (4 chiffres)</Form.Label>
                <Form.Control
                  type="text"
                  value={newPin}
                  maxLength={4}
                  onChange={(e) => setNewPin(e.target.value)}
                  isInvalid={!/^\d{4}$/.test(newPin) && newPin.length > 0}
                />
                <Form.Text className="text-danger">
                  Entrez un code à 4 chiffres
                </Form.Text>
              </Form.Group>
              <div className="d-flex justify-content-end mt-3">
                <Button type="submit" disabled={!/^\d{4}$/.test(newPin)}>
                  Confirmer
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal d'échec */}
      <Modal show={showVerificationFailedModal} onHide={handleCloseAll} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Vérification échouée</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            La vérification du client a échoué. Vous pouvez transférer le client vers le back-office pour une
            vérification plus approfondie ou mettre fin à l'appel.
          </p>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button variant="outline-primary" onClick={handleCloseAll}>Fermer</Button>
          <Button variant="primary" onClick={handleCloseAll}>Transférer au Back-Office</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ResetPinModalWithVerification;
