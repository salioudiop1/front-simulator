import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { generateSecurityQuestions } from '../../utils/securityQuestions';
import { useUserContext } from '../../utils/UserContext';

const DormancyUnblockModal = ({ show, onClose, user, onUnblock, onRecoverPin }) => {
  const { setSelectedUser } = useUserContext();
  const [step, setStep] = useState('ask');
  const [questions, setQuestions] = useState([]);
  const [questionStates, setQuestionStates] = useState([]);
  const [fromForgot, setFromForgot] = useState(false);

  useEffect(() => {
    if (show) {
      setStep('ask');
      setFromForgot(false);
      const qList = generateSecurityQuestions(user);
      setQuestions(qList);
      setQuestionStates(Array(qList.length).fill(null));
    }
  }, [show, user]);

  const resetAll = () => {
    onClose?.(step === 'done');
    setStep('ask');
    setQuestions([]);
    setQuestionStates([]);
    setFromForgot(false);
  };

  const removeDormancyBlock = () => {
    const updated = {
      ...user,
      restrictions: user.restrictions?.filter(r => r.title !== 'Dormancy Block'),
    };
    setSelectedUser(updated);
    onUnblock?.();
    setStep('done');
  };

  const handleValidation = () => {
    const correctCount = questionStates.filter(v => v === true).length;
    if (correctCount >= 3) {
      setFromForgot(true);
      setStep('confirm');
    } else {
      setStep('fail');
    }
  };

  const disableRecoverPinButtonTemporarily = () => {
  window.dispatchEvent(new Event('disableRecoverPin'));
};



  const incorrectCount = questionStates.filter(v => v === false).length;
  const dynamicVisibleCount = Math.min(3 + incorrectCount, questions.length);
  const visibleQuestions = questions.slice(0, dynamicVisibleCount);
  const allAnswered = questionStates.slice(0, dynamicVisibleCount).every(v => v !== null);

  return (
    <>
      {/* Étape 1 : Question initiale */}
      <Modal show={show && step === 'ask'} onHide={resetAll} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Débloquer le compte</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Le client se souvient-il de son code secret ?
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="secondary" onClick={() => setStep('verify')}>Non</Button>
            <Button variant="primary" onClick={() => {
              setFromForgot(false);
              setStep('confirm');
            }}>
              Oui
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Étape 2 : Vérification d’identité */}
      <Modal show={show && step === 'verify'} onHide={resetAll} dialogClassName="modal-lg">
        <Modal.Header closeButton>
          <Modal.Title>🔐 Vérification d'identité</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {visibleQuestions.map((q, i) => (
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
          <div className="d-flex justify-content-end mt-3">
            <Button variant="primary" disabled={!allAnswered} onClick={handleValidation}>
              Valider l'identité
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Étape 3 : Confirmation */}
      <Modal show={show && step === 'confirm'} onHide={resetAll} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Débloquer le compte</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {fromForgot ? (
            <>
              <p>Le client a été vérifié avec succès.</p>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="primary" onClick={() => {
                disableRecoverPinButtonTemporarily();
                  removeDormancyBlock();
                }}>
                  Débloquer & Réinitialiser PIN
                </Button>
              </div>
            </>
          ) : (
            <>
              <p>Le client se souvient de son code secret. Confirmez le déblocage du compte.</p>
              <div className="d-flex justify-content-end">
                <Button variant="primary" onClick={removeDormancyBlock}>
                  Débloquer le compte
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Étape 4 : Succès */}
<Modal show={show && step === 'done'} onHide={resetAll} dialogClassName="modal-top">
  <Modal.Header closeButton>
    <Modal.Title>Succès</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Alert>
        Le compte a été débloqué avec succès.
        {fromForgot && (
        <div className="mt-2">
            Le client a maintenant <strong>10 minutes</strong> pour saisir et confirmer son nouveau code PIN.
        </div>
        )}
    </Alert>
    <div className="d-flex justify-content-end mt-3">
        <Button variant="primary" onClick={resetAll}>Fermer</Button>
        </div>
  </Modal.Body>
</Modal>


      {/* Étape 5 : Échec de vérification */}
      <Modal show={show && step === 'fail'} onHide={resetAll} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Vérification échouée</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ❌ Le client n'a pas réussi à répondre correctement. Transférez vers le back-office ou terminez l'appel.
          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" onClick={resetAll}>Fermer</Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DormancyUnblockModal;
