import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { generateSecurityQuestions } from '../../utils/securityQuestions';
import { useUserContext } from '../../utils/UserContext';

const RecoverPinModal = ({ show, onClose, user, onRecover }) => {
  const [questions, setQuestions] = useState([]);
  const [questionStates, setQuestionStates] = useState([]);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [showVerificationFailedModal, setShowVerificationFailedModal] = useState(false);
  const { selectedUser, updateUser } = useUserContext();

  const resetQuestions = (user) => {
    const qList = generateSecurityQuestions(user);
    setQuestions(qList);
    setQuestionStates(Array(qList.length).fill(null));
  };

  useEffect(() => {
    if (user) resetQuestions(user);
  }, [user]);

  useEffect(() => {
    if (!show && !showFinalConfirm && !showVerificationFailedModal && user) {
      resetQuestions(user);
    }
  }, [show, showFinalConfirm, showVerificationFailedModal, user]);

  const incorrectCount = questionStates.filter(v => v === false).length;
  const correctCount = questionStates.filter(v => v === true).length;
  const dynamicVisibleCount = Math.min(3 + incorrectCount, questions.length);
  const visibleQuestionStates = questionStates.slice(0, dynamicVisibleCount);
  const allAnswered = visibleQuestionStates.every(v => v !== null);

  const handleValidation = () => {
    if (correctCount >= 3) {
      onClose();
      setTimeout(() => {
        setShowFinalConfirm(true);
      }, 300);
    } else {
      onClose();
      setTimeout(() => {
        setShowVerificationFailedModal(true);
      }, 300);
    }
  };

  return (
    <>
      {/* Modal principal de vérification */}
      <Modal show={show} onHide={onClose} dialogClassName="modal-lg">
        <Modal.Header closeButton>
          <Modal.Title>🔐 Vérification d'identité pour le Recovery PIN</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {questions
            .slice(0, dynamicVisibleCount)
            .map((q, i) => {
              const realIndex = questions.findIndex(qt => qt.id === q.id);
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
                        }}
                      >
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
                        }}
                      >
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
              onClick={handleValidation}
            >
              Valider l'identité
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal de confirmation récupération PIN */}
      <Modal show={showFinalConfirm} onHide={() => setShowFinalConfirm(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Confirmation du Recover PIN</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-end">
          {selectedUser?.id === user.id && selectedUser?.recovery ? (
            <Alert variant="success" className="text-start">
              Succès ! Le client a maintenant 10 minutes pour saisir et confirmer son nouveau code PIN.
            </Alert>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                onRecover();
                updateUser(user.id, { recovery: true });
              }}
            >
              Confirmer le Recover PIN
            </Button>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal d'échec de vérification */}
      <Modal show={showVerificationFailedModal} onHide={() => setShowVerificationFailedModal(false)} dialogClassName="modal-top">
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
          <Button variant="outline-primary" onClick={() => setShowVerificationFailedModal(false)}>Fermer</Button>
          <Button variant="primary" onClick={() => {
            // Action à définir ici si besoin
            setShowVerificationFailedModal(false);
          }}>
            Transférer au Back-Office
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RecoverPinModal;
