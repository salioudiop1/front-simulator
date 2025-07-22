import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Badge, Form, Modal } from 'react-bootstrap';
import { useUserContext } from '../../utils/UserContext';
import RecoverPinModal from '../RecoverPinModal';
import ResetPinModalWithVerification from '../ResetPinModalWithVerification';
import RenameUserModal from '../RenameUserModal';

const PersonalPanel = ({ authUser }) => {
  const { selectedUser: user, updateUser } = useUserContext();
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showRecoverPinModal, setShowRecoverPinModal] = useState(false);
  const [recoverConfirmed, setRecoverConfirmed] = useState(false);
  const [recoverDisabled, setRecoverDisabled] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [billSentIndex, setBillSentIndex] = useState(null);
  const [dialing, setDialing] = useState(false);
  const [supportNumber, setSupportNumber] = useState('');
  const [error, setError] = useState('');
  const [confirmingCodeIdx, setConfirmingCodeIdx] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showEscalateSuccess, setShowEscalateSuccess] = useState(false);

  const [showVaultModal, setShowVaultModal] = useState(false);

  const [showUnlockConfirmModal, setShowUnlockConfirmModal] = useState(false);
  const [showMoveConfirmModal, setShowMoveConfirmModal] = useState(false);

  const [showVisaModal, setShowVisaModal] = useState(false);
  const [showDeleteCardModal, setShowDeleteCardModal] = useState(false);
  const [showBlockCardModal, setShowBlockCardModal] = useState(false);
  const [showLockCardModal, setShowLockCardModal] = useState(false);
  const [cardActionSuccess, setCardActionSuccess] = useState('');

  const [showVisaTransferModal, setShowVisaTransferModal] = useState(false);
  const [visaTransferSuccess, setVisaTransferSuccess] = useState(false);

  const [showPhotoReviewModal, setShowPhotoReviewModal] = useState(false);


  const [escalateComment, setEscalateComment] = useState('');
  const [escalateIssue, setEscalateIssue] = useState('');

  const [escalationHistory, setEscalationHistory] = useState([]);

  const [showForgetQRModal, setShowForgetQRModal] = useState(false);
  const [qrForgotten, setQrForgotten] = useState(false);

  const [showResetPinModal, setShowResetPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSet, setPinSet] = useState(false);
  const handleResetPin = (e) => {
    e.preventDefault();
    if (/^\d{4}$/.test(newPin)) {
      setPinSet(true);
    }
  };

  const [showSendLinkModal, setShowSendLinkModal] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const handleSendLink = () => {
    setShowSendLinkModal(true);
    setLinkSent(false);
  };

  const handleSubmitSendLink = (e) => {
    e.preventDefault();
    setLinkSent(true);
  };

  const [showRequestMerchantModal, setShowRequestMerchantModal] = useState(false);
  const [merchantLinkSent, setMerchantLinkSent] = useState(false);


  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameReason, setRenameReason] = useState('');
  const [renameConfirmed, setRenameConfirmed] = useState(null); // null ou { previousName, newName }


  const [showManualAirtimeModal, setShowManualAirtimeModal] = useState(false);
  const [airtimeAmount, setAirtimeAmount] = useState('');
  const [airtimeConfirmed, setAirtimeConfirmed] = useState(false);
  const userBalance = Number(user.balance);
  const validAmount = Number(airtimeAmount);
  const newBalance = (userBalance - (validAmount || 0));

  const handleAirtimeSubmit = (e) => {
    e.preventDefault();
    if (isNaN(validAmount) || validAmount <= 0 || validAmount > userBalance) return;

    const newTransaction = {
      date: new Date().toLocaleString(),
      amount: -validAmount.toFixed(0),
      type: "bill_payment",
      billType: "Airtime",
      details: 'Manual Airtime Purchase',
      id: `TX${Math.floor(100000 + Math.random() * 900000)}`,
      dateRaw: new Date(),
      recipient: user.phone,
      balance: newBalance
    };

    const updatedTransactions = [
      newTransaction,
      ...(user.transactions || [])
    ];

    const updatedBalance = Number((userBalance - validAmount).toFixed(0));

    updateUser(user.id, {
      transactions: updatedTransactions,
      balance: updatedBalance
    });

    setAirtimeConfirmed(true);
  };


  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockConfirmed, setBlockConfirmed] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutConfirmed, setLogoutConfirmed] = useState(false);

  const [showLimitsModal, setShowLimitsModal] = useState(false);

  const [showAwardCreditModal, setShowAwardCreditModal] = useState(false);
  const [awardAmount, setAwardAmount] = useState('');
  const [awardReason, setAwardReason] = useState('');
  const [awardConfirmed, setAwardConfirmed] = useState(false);

  const [showMerchantIssueModal, setShowMerchantIssueModal] = useState(false);
  const [merchantReporter, setMerchantReporter] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [merchantTransactionId, setMerchantTransactionId] = useState('');
  const [merchantIssue, setMerchantIssue] = useState('');
  const [merchantComment, setMerchantComment] = useState('');
  const [merchantHistory, setMerchantHistory] = useState([]);
  const [showMerchantSuccess, setShowMerchantSuccess] = useState(false);

  const [showRequestAgentModal, setShowRequestAgentModal] = useState(false);
  const [agentLinkSent, setAgentLinkSent] = useState(false);

  function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateStr).toLocaleString('en-US', options);
  }  

  useEffect(() => {
  const handleDisable = () => {
    const btn = document.getElementById('recoverPinButton');
    if (btn) {
      btn.disabled = true;
      setTimeout(() => {
        btn.disabled = false;
      }, 60000); // 1 min
    }
  };

  window.addEventListener('disableRecoverPin', handleDisable);
  return () => window.removeEventListener('disableRecoverPin', handleDisable);
}, []);


  useEffect(() => {
    setRecoverDisabled(false);
  }, [user?.id]);
  

  useEffect(() => {
    if (recoverConfirmed) {
      setRecoverDisabled(true);
      const timer = setTimeout(() => setRecoverDisabled(false), 60000);
      return () => clearTimeout(timer);
    }
  }, [recoverConfirmed]);

  if (!user) return null;

  const handleShowSMS = () => setShowSMSModal(true);
  const handleCloseSMS = () => setShowSMSModal(false);

  const handleShowBill = () => {
    setBillSentIndex(null);
    setConfirmingCodeIdx(null);
    setConfirmed(false);
    setShowBillModal(true);
  };
  const handleCloseBill = () => setShowBillModal(false);

  const handleShowCall = () => {
    setDialing(false);
    setSupportNumber('');
    setError('');
    setShowCallModal(true);
  };
  const handleCloseCall = () => setShowCallModal(false);

  const handleSendCode = (index) => {
    setConfirmingCodeIdx(index);
    setConfirmed(false);
  };

  const handleConfirmSend = () => {
    setBillSentIndex(confirmingCodeIdx);
    setConfirmed(true);
  };

  const isValidPhone = (phone) => /^\+221\d{9}$/.test(phone);

  const handleCall = (e) => {
    e.preventDefault();
    if (!isValidPhone(supportNumber)) {
      setError('Invalid phone number format. Must be +221 followed by 9 digits.');
      return;
    }
    setError('');
    setDialing(true);
  };

  const clearableRestrictions = [
    'Login failed on too many mobile numbers',
    'Login PIN attempts exceeded'
  ];

  const filteredRestrictions = (user.restrictions || []).filter(r => !clearableRestrictions.includes(r.title));
  const hasClearableBlock = (user.restrictions || []).some(r => clearableRestrictions.includes(r.title));

  const handleClearPinBlock = () => {
    updateUser(user.id, { restrictions: filteredRestrictions });
  };

  const handleSubmitEscalation = (e) => {
    e.preventDefault();
    if (escalateComment && escalateIssue) {
      const newTicket = {
        date: new Date().toLocaleString(),
        status: 'Pending',
        clickUpId: `CU${Math.floor(100000 + Math.random() * 900000)}`,
        issue: escalateIssue,
        ticketId: `TID${Math.floor(100000 + Math.random() * 900000)}`
      };
      setEscalationHistory((prev) => [...prev, newTicket]);
      setShowEscalateSuccess(true);
    }
  };

  const handleMerchantIssueSubmit = (e) => {
    e.preventDefault();
    if (merchantReporter && merchantIssue) {
      const newItem = {
        date: new Date().toLocaleString(),
        status: "Pending",
        clickUpId: "CU" + Math.floor(Math.random() * 900000 + 100000)
      };
      setMerchantHistory([newItem, ...merchantHistory]);
      setShowMerchantSuccess(true);
    }
  };

  function formatAmount(amount) {
    return Number(amount)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }  

  const handleUnlockVaultEarly = () => {
    const newEntry = {
      lockedOn: user.vaultLockedOn || user.vaultHistory?.at(-1)?.lockedOn || new Date().toISOString(),
      plannedUnlock: user.vaultLockedUntil,
      unlockedEarly: true,
      unlockedOn: new Date().toISOString(),
      amount: user.vaultBalance
    };
  
    const updatedHistory = [newEntry, ...(user.vaultHistory || [])];
  
    updateUser(user.id, {
      vaultLocked: false,
      vaultHistory: updatedHistory
    });
  };  
  
  const handleMoveVaultToMain = () => {
    const vaultAmount = Number(user.vaultBalance);
    const updatedBalance = Number(user.balance) + vaultAmount;
  
    const newTx = {
      id: `TX${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'transferFromVault',
      amount: vaultAmount,
      date: new Date().toLocaleString(),
      details: 'TransferFromSavingsEntry',
      title: 'Transfer from Vault',
      balance: updatedBalance,
    };
  
    updateUser(user.id, {
      balance: updatedBalance,
      vaultBalance: 0,
      transactions: [newTx, ...(user.transactions || [])],
    });
  
    setShowVaultModal(false);
  };  

  const getPendingAmount = () => {
    return (user.transactions || [])
      .filter(tx => tx.type === 'freeze_notice')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }; 


  return (
    <div className="bg-light p-3 border-bottom">
      <div className="mb-2 d-flex flex-wrap gap-2">
        <Badge bg="primary">{user.kyc2 ? 'KYC-2' : 'KYC-1'}</Badge>
        {user.photo && (
          <Badge
            bg="primary"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowPhotoReviewModal(true)}
          >
            PHOTO - ACCEPTED
          </Badge>
        )}
        {!user.photo && <Badge bg="primary">PHOTO - NO_PHOTOS</Badge>}
        {user.appVersion && <Badge bg="primary">ANDROID APP USER ({user.appVersion})</Badge>}
        {user.multiAccount && <Badge bg="purple">MULTI-ACCOUNT</Badge>}
        {user.promoIneligible && <Badge bg="warning" text="dark">Promo 1st payment – ineligible</Badge>}
        {user.vault && (
          <Badge
            bg="purple"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowVaultModal(true)}
          >
            VAULT
          </Badge>
        )}
        {user.gifts && <Badge bg="warning" text="dark">GIFTS</Badge>}
        {user.kyc2 && user.virtualVisa && (
          <span className="badge" style={{ backgroundColor: '#e0b7ff', color: '#5c1d91', cursor: 'pointer' }} onClick={() => setShowVisaModal(true)}>
          VISA CARD
        </span>        
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <i>Balance</i>
        <span className="fw-bold">{formatAmount(user.balance)}F</span>
      </div>
      {
        getPendingAmount() !== 0 && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <i>Amount pending</i>
            <span>{formatAmount(getPendingAmount())}F</span>
          </div>
        )
      }

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex flex-wrap gap-2">
          <Button variant="outline-dark" onClick={handleShowSMS}>SMS Code</Button>
          <Button variant="outline-dark" onClick={handleShowBill}>Bill pay code</Button>
          <Button variant="outline-dark" onClick={handleShowCall}>Call user</Button>
          <Button variant="outline-dark" disabled={!hasClearableBlock} onClick={handleClearPinBlock}>Clear PIN block</Button>
          <Button variant="outline-dark" id='recoverPinButton' disabled={recoverDisabled} onClick={() => { setShowRecoverPinModal(true); setRecoverConfirmed(false); }}>Recover PIN</Button>

          <Dropdown>
            <Dropdown.Toggle variant="outline-dark">Escalate</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setShowEscalateModal(true)}>Escalate to Support Group Lead</Dropdown.Item>
              <Dropdown.Item onClick={() => setShowMerchantIssueModal(true)}>Merchant issue</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle variant="outline-dark">More</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {setShowForgetQRModal(true); setQrForgotten(false);}}>Forget QR</Dropdown.Item>              
              <Dropdown.Item onClick={() => setShowResetPinModal(true)}>Reset PIN</Dropdown.Item>
              <Dropdown.Item disabled>Manual Transfer</Dropdown.Item>
              <Dropdown.Item onClick={() => setShowManualAirtimeModal(true)}>Manual Airtime Purchase</Dropdown.Item>
              <Dropdown.Item onClick={handleSendLink}>Send link to Customer App</Dropdown.Item>
              <Dropdown.Item onClick={() => {setShowRequestAgentModal(true); setAgentLinkSent(false);}}>Request to be an agent</Dropdown.Item>
              <Dropdown.Item onClick={() => {setShowRequestMerchantModal(true); setMerchantLinkSent(false);}}>Request to be a merchant</Dropdown.Item>
              <Dropdown.Item onClick={() => {setNewName(user.name); setRenameReason(''); setRenameConfirmed(false); setShowRenameModal(true);}}>Rename User</Dropdown.Item>
              <Dropdown.Item disabled>Detach from linked ID</Dropdown.Item>
              <Dropdown.Item onClick={() => { setBlockReason(''); setBlockConfirmed(false); setShowBlockModal(true); }}>Block user by mobile</Dropdown.Item>              
              <Dropdown.Item disabled>Block user by legal entity</Dropdown.Item>
              <Dropdown.Item disabled>Block device</Dropdown.Item>
              <Dropdown.Item onClick={() => { setLogoutConfirmed(false); setShowLogoutModal(true); }}>Logout devices</Dropdown.Item>
              <Dropdown.Item disabled>Linked B2W device details</Dropdown.Item>
              <Dropdown.Item onClick={() => setShowLimitsModal(true)}>Calculate Limits</Dropdown.Item>
              <Dropdown.Item onClick={() => { setAwardAmount(''); setAwardReason(''); setAwardConfirmed(false); setShowAwardCreditModal(true); }}>Award Credit</Dropdown.Item>
              <Dropdown.Item disabled>Cancel all ATX</Dropdown.Item>
              <Dropdown.Item disabled>Move Balance</Dropdown.Item>
              <Dropdown.Item disabled>Add user to Agent Gaming Whitelist</Dropdown.Item>
              <Dropdown.Item disabled>Add user to Agent Gaming Watchlist</Dropdown.Item>
              <Dropdown.Item disabled>Terminate user</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Form.Control type="text" placeholder="Jump to Date" style={{ maxWidth: '150px' }} readOnly />
          <Button variant="primary">Today</Button>
        </div>
      </div>

      <RecoverPinModal
        show={showRecoverPinModal}
        onClose={() => setShowRecoverPinModal(false)}
        user={user}
        onRecover={() => {
          setRecoverConfirmed(true);
          setShowRecoverPinModal(false);
        }}
      />

      <Modal
        show={showEscalateModal}
        onHide={() => setShowEscalateModal(false)}
        onExited={() => {setShowEscalateSuccess(false); setEscalateComment(''); setEscalateIssue('')}} // Réinitialise après fermeture
        dialogClassName="modal-top"
      >
        <Modal.Header closeButton>
          <Modal.Title>Escalate to Support Group Lead</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!showEscalateSuccess ? (
            <Form onSubmit={handleSubmitEscalation}>
              <Form.Group className="mb-4">
                <Form.Label htmlFor="mobile">Customer mobile</Form.Label>
                <Form.Control id="mobile" type="text" value={user.phone} readOnly />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label htmlFor="comments">Comments</Form.Label>
                <Form.Control
                  id="comments"
                  as="textarea"
                  rows={3}
                  value={escalateComment}
                  onChange={(e) => setEscalateComment(e.target.value)}
                  isInvalid={!escalateComment}
                />
                {!escalateComment && (
                  <Form.Text className="text-danger">Please fill out the comments section.</Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label htmlFor="problem">Issue</Form.Label>
                <Form.Select
                  id="problem"
                  value={escalateIssue}
                  onChange={(e) => setEscalateIssue(e.target.value)}
                  isInvalid={!escalateIssue}
                >
                  <option value="" disabled>Select an issue</option>
                  <option value="ATX_CORRECTION">ATX correction</option>
                  <option value="MOVE_BALANCE">Move balance request</option>
                  <option value="LANGUAGE_CALLBACK">Language callback</option>
                  <option value="REFUND_QUESTION">Refund question</option>
                  <option value="B2W_LINKING">B2W device linking</option>
                  <option value="OTHER">Other</option>
                </Form.Select>
                {!escalateIssue && (
                  <Form.Text className="text-danger">Please select an issue</Form.Text>
                )}
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button type="submit" disabled={!escalateComment || !escalateIssue}>Send</Button>
              </div>
            </Form>
          ) : (
            <>
              <div className="alert alert-success fade show mt-3">
                <span className="flex-grow">
                  Success! The escalation has been submitted to the Support Group Lead.
                </span>
              </div>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="primary" onClick={() => setShowEscalateModal(false)}>Done</Button>
              </div>
            </>
          )}

          <hr />
          <p>History of Escalations</p>
          <div style={{ maxHeight: '250px', overflowY: 'auto', fontSize: "12px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Reported on</th>
                  <th>Status</th>
                  <th>ClickUp ID</th>
                  <th>Issue</th>
                  <th>Ticket ID</th>
                </tr>
              </thead>
              <tbody>
                {escalationHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" align="center">No escalations</td>
                  </tr>
                ) : (
                  escalationHistory.map((ticket, index) => (
                    <tr key={index}>
                      <td>{ticket.date}</td>
                      <td>{ticket.status}</td>
                      <td>{ticket.clickUpId}</td>
                      <td>{ticket.issue}</td>
                      <td>{ticket.ticketId}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Modal.Body>
      </Modal>

      {/* Merchant Issue Modal */}
      <Modal
        show={showMerchantIssueModal}
        onHide={() => setShowMerchantIssueModal(false)}
        onExited={() => {setShowMerchantSuccess(false); setMerchantComment(''); setMerchantIssue('')}} // Reset après fermeture
        dialogClassName="modal-top"
      >
        <Modal.Header closeButton>
          <Modal.Title>Report Merchant Issue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!showMerchantSuccess ? (
            <Form onSubmit={handleMerchantIssueSubmit}>
              <Form.Group className="mb-4">
                <Form.Label>Who is reporting the issue?</Form.Label>
                <Form.Select
                  value={merchantReporter}
                  onChange={(e) => setMerchantReporter(e.target.value)}
                  isInvalid={!merchantReporter}
                >
                  <option value="" disabled>Select a reporter</option>
                  <option value="Merchant">Merchant</option>
                  <option value="Customer">Customer</option>
                </Form.Select>
                {!merchantReporter && (
                  <Form.Text className="text-danger">Please select who is reporting this issue.</Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Customer mobile</Form.Label>
                <Form.Control type="text" value={user.phone} readOnly />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Merchant ID</Form.Label>
                <Form.Control value={merchantId} onChange={(e) => setMerchantId(e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Transaction ID</Form.Label>
                <Form.Control value={merchantTransactionId} onChange={(e) => setMerchantTransactionId(e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Issue</Form.Label>
                <Form.Select
                  value={merchantIssue}
                  onChange={(e) => setMerchantIssue(e.target.value)}
                  isInvalid={!merchantIssue}
                >
                  <option value="" disabled>Select an issue</option>
                  <option value="REFUND_REQUEST">Refund request</option>
                  <option value="ADD_REMOVE_ASSISTANT">Add/remove assistant</option>
                  <option value="KYB_REQUEST">KYB request</option>
                  <option value="NOT_SEEING_PAYMENTS">Not seeing payments</option>
                  <option value="VERIFY_FIELD_EMPLOYEE">Verify field employee</option>
                  <option value="BUSINESS_PROPOSAL_FOLLOW_UP">Business proposal follow up</option>
                  <option value="NEEDS_MERCHANT_QR_CODE">Needs a merchant QR code</option>
                  <option value="NEEDS_HELP_WITH_MERCHANT_SIGNUP">Needs help with merchant signup</option>
                  <option value="NEEDS_MERCHANT_TRAINING">Needs training</option>
                  <option value="RENAME_BUSINESS">Rename business</option>
                  <option value="DEACTIVATION_REQUEST">Deactivation request</option>
                  <option value="OTHER">Other</option>
                </Form.Select>
                {!merchantIssue && (
                  <Form.Text className="text-danger">Please select an issue</Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Comments</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={merchantComment}
                  onChange={(e) => setMerchantComment(e.target.value)}
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button type="submit" disabled={!merchantReporter || !merchantIssue}>Send</Button>
              </div>
            </Form>
          ) : (
            <>
              <div className="alert alert-success fade show mt-3">
                <span className="flex-grow">Success! The merchant issue has been reported.</span>
              </div>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="primary" onClick={() => setShowMerchantIssueModal(false)}>Done</Button>
              </div>
            </>
          )}

          <hr />
          <p>History of Escalations</p>
          <table className="table" style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                <th>Reported on</th>
                <th>Status</th>
                <th>ClickUp ID</th>
              </tr>
            </thead>
            <tbody>
              {merchantHistory.length === 0 ? (
                <tr><td colSpan="3" align="center">No escalations</td></tr>
              ) : (
                merchantHistory.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.status}</td>
                    <td>{item.clickUpId}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Modal.Body>
      </Modal>

      {/* SMS Modal */}
      <Modal show={showSMSModal} onHide={handleCloseSMS} dialogClassName="modal-top" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>SMS code for {user.phone}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Unable to show SMS code</h5>
          <div className="alert alert-danger mt-3" role="alert">
            User <strong>{authUser?.email || "unknown user"}</strong> doesn't fulfill all requirements to use <strong>supportapp_show_sms_code</strong>.
          </div>
        </Modal.Body>
      </Modal>

      {/* Bill Pay Code Modal */}
      <Modal show={showBillModal} onHide={handleCloseBill} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Bill pay codes for {user.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmingCodeIdx !== null ? (
            <div>
              <h5 className="mb-3">
                Send {user.billPayCodes[confirmingCodeIdx].type} code <strong>{user.billPayCodes[confirmingCodeIdx].code}</strong> to {user.name} <br />
                ({user.phone})?
              </h5>
              {confirmed ? (
                <div className="alert alert-success d-flex justify-content-between align-items-center">
                  Bill pay code sent! <Button onClick={() => setConfirmingCodeIdx(null)}>Done</Button>
                </div>
              ) : (
                <Form onSubmit={(e) => { e.preventDefault(); handleConfirmSend(); }}>
                  <div className="d-flex justify-content-end">
                    <Button type="submit">Confirm</Button>
                  </div>
                </Form>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Bill Type</th>
                    <th>When created</th>
                    <th>Send Amount</th>
                    <th>Code</th>
                    <th>Send Code</th>
                  </tr>
                </thead>
                <tbody>
                  {(user.billPayCodes || []).map((code, idx) => (
                    <tr key={idx}>
                      <td>{code.type}</td>
                      <td>{code.date}</td>
                      <td>{code.amount}</td>
                      <td style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{code.code}</td>
                      <td>
                        <Button variant="outline-dark" onClick={() => handleSendCode(idx)}>Send</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Call User Modal */}
      <Modal show={showCallModal} onHide={handleCloseCall} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Call {user.name} ({user.phone})?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCall}>
            <Form.Group className="mb-4">
              <Form.Label>Support mobile (your number)</Form.Label>
              <Form.Control
                type="text"
                value={supportNumber}
                onChange={(e) => setSupportNumber(e.target.value)}
                isInvalid={!!error}
              />
              <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
            </Form.Group>
            {dialing ? (
              <div className="alert alert-success d-flex justify-content-between align-items-center">
                Dialing... <Button variant="primary" onClick={handleCloseCall}>Done</Button>
              </div>
            ) : (
              <div className="d-flex justify-content-end">
                <Button type="submit" variant="primary">Call</Button>
              </div>
            )}
          </Form>
        </Modal.Body>
      </Modal>


      {/* Forget QR Modal */}
      <Modal show={showForgetQRModal} onHide={() => setShowForgetQRModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Forget QR card for {user.name}?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            setQrForgotten(true);
          }}>
            <p><span className="text badge bg-info">✓ PIN code set</span></p>
            <p>The QR card will be detached from this user account.</p>
            <p>Note: credit cards are not affected by this action.</p>
            {qrForgotten ? (
              <div role="alert" className="alert alert-success d-flex justify-content-between align-items-center">
                This user has no QR code to forget <Button variant="primary" onClick={() => setShowForgetQRModal(false)}>Done</Button>
              </div>
            ) : (
              <div>
                <Button type="submit" data-testid="submit-button" className="float-right btn btn-primary">Confirm</Button>
                <div className="clearfix"></div>
              </div>
            )}
          </Form>
        </Modal.Body>
      </Modal>


      <ResetPinModalWithVerification
        show={showResetPinModal}
        onClose={() => setShowResetPinModal(false)}
        user={user}
        onReset={(newPin) => console.log("✔ Nouveau PIN défini :", newPin)}
      />


      {/* Manual Airtime Purchase Modal */}
      <Modal show={showManualAirtimeModal} onHide={() => setShowManualAirtimeModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Buy Airtime on behalf of {user.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Current balance: {user.balance}F</p>
          <Form onSubmit={handleAirtimeSubmit} autoComplete="off">
            <Form.Group className="mb-4">
              <Form.Label>Airtime Recipient</Form.Label>
              <Form.Control
                value={`${user.phone}  •  ${user.name}`}
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Amount</Form.Label>
              <div className="input-group">
                <span className="input-group-text" data-testid="currency">CFA</span>
                <Form.Control
                  type="text"
                  value={airtimeAmount}
                  onChange={(e) => setAirtimeAmount(e.target.value)}
                  disabled={airtimeConfirmed}
                />
              </div>

              {airtimeAmount && !isNaN(validAmount) && (
                <small className="form-text">
                  {user.name}'s new balance will be {newBalance}F
                </small>
              )}

              {airtimeAmount && !isNaN(validAmount) && validAmount > userBalance && !airtimeConfirmed && (
                <div className="text-danger mt-1">Insufficient balance</div>
              )}
            </Form.Group>

            {airtimeConfirmed ? (
              <div className="alert alert-success fade show d-flex justify-content-between align-items-center">
                <span className="flex-grow">Airtime purchase successful!</span>
                <Button
                  onClick={() => {
                    setShowManualAirtimeModal(false);
                    setAirtimeAmount('');
                    setAirtimeConfirmed(false);
                  }}
                  data-testid="form-done-button"
                  className="float-right btn btn-primary"
                >
                  Done
                </Button>
              </div>
            ) : (
              <div className="d-flex justify-content-end">
                <Button
                  type="submit"
                  className="float-right btn btn-primary"
                  data-testid="submit-button"
                  disabled={!airtimeAmount || isNaN(validAmount) || validAmount <= 0 || validAmount > userBalance}
                >
                  Buy
                </Button>
              </div>
            )}
          </Form>
        </Modal.Body>
      </Modal>


      {/* Send Link to Customer App Modal */}
      <Modal show={showSendLinkModal} onHide={() => setShowSendLinkModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Send {user.name} a link to download the Customer App?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitSendLink} autoComplete="off">
            <Form.Group className="mb-4">
              <Form.Label htmlFor="mobile">Mobile</Form.Label>
              <div className="input-group">
                <Form.Control
                  id="mobile"
                  type="text"
                  value={user.phone}
                  disabled={linkSent}
                />
              </div>
            </Form.Group>

            {linkSent ? (
              <div className="alert alert-success fade show d-flex justify-content-between align-items-center">
                <span className="flex-grow">Link sent!</span>
                <Button data-testid="form-done-button" onClick={() => setShowSendLinkModal(false)} className="float-right btn btn-primary">Done</Button>
              </div>
            ) : (
              <div className="d-flex justify-content-end">
                <Button type="submit" data-testid="submit-button" className="float-right btn btn-primary">Send</Button>
              </div>
            )}
          </Form>
        </Modal.Body>
      </Modal>


      <Modal show={showRequestAgentModal} onHide={() => setShowRequestAgentModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>New Send {user.phone} link to request to be an agent</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            setAgentLinkSent(true);
          }}>
            {agentLinkSent ? (
              <div role="alert" className="alert alert-success fade show d-flex justify-content-between align-items-center">
                <span className="flex-grow">Link sent!</span>
                <Button type="button" data-testid="form-done-button" className="float-right btn btn-primary" onClick={() => setShowRequestAgentModal(false)}>
                  Done
                </Button>
              </div>
            ) : (
              <div>
                <Button type="submit" data-testid="submit-button" className="float-right btn btn-primary">Confirm</Button>
                <div className="clearfix"></div>
              </div>
            )}
          </Form>
        </Modal.Body>
      </Modal>


      <Modal show={showRequestMerchantModal} onHide={() => setShowRequestMerchantModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Request from {user.name} to become a merchant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            setMerchantLinkSent(true);
          }}>
            <div role="alert" className="fade alert alert-info show">
              <p className="fw-bold mb-2">New!</p>
              <p>{user.name} can download the latest version of the Wave Business app and self-signup if they meet all the eligibility requirements.</p>
            </div>

            <p className="h5 pt-4">Eligibility Requirements</p>
            <ul className="py-2">
              <li className="pb-2">
                <p className="fw-semibold">Has user account: ✅</p>
              </li>
              <li className="pb-2">
                <p className="fw-semibold">KYC2: {user.kyc2 ? '✅' : '❌'}</p>
              </li>
              <li className="pb-2">
                <p className="fw-semibold">Has no other merchant account: {user.merchant ? '❌' : '✅'}</p>
                {user.merchant && (
                  <p className="text-danger pt-2">The user already has a merchant account so they are not eligible for self-signup. Please escalate the issue to the Payments team using the “Escalate merchant issue” button.</p>
                )}
              </li>
              <li className="pb-2">
                <p className="fw-semibold">Other reasons: ❌</p>
                <p className="text-danger pt-2">This user is currently ineligible for self-signup. Contact @in-person-payments-oneoff for more information.</p>
              </li>
            </ul>

            <div className="py-4">
              <p>Do you want to send {user.name} a link to download the Wave Business app?</p>
            </div>

            {merchantLinkSent ? (
              <div role="alert" className="alert alert-success fade show d-flex justify-content-between align-items-center">
                <span className="flex-grow">Link to app sent as text message!</span>
                <Button type="button" data-testid="form-done-button" className="float-right btn btn-primary" onClick={() => setShowRequestMerchantModal(false)}>Done</Button>
              </div>
            ) : (
              <div>
                <Button type="submit" data-testid="submit-button" className="float-right btn btn-primary">Send</Button>
                <div className="clearfix"></div>
              </div>
            )}
          </Form>
        </Modal.Body>
      </Modal>

      <RenameUserModal
        show={showRenameModal}
        onClose={() => {
          setShowRenameModal(false);
          setRenameConfirmed(null);
          setNewName('');
          setRenameReason('');
        }}
        user={user}
        newName={newName}
        setNewName={setNewName}
        renameReason={renameReason}
        setRenameReason={setRenameReason}
        renameConfirmed={renameConfirmed}
        setRenameConfirmed={setRenameConfirmed}
        updateUser={updateUser}
      />


      <Modal show={showBlockModal} onHide={() => setShowBlockModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Block account {user.phone}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            const newBlock = {
              title: 'Complete block by mobile number',
              icon: '❌',
              reason: blockReason || 'No reason provided',
              blockedBy: authUser?.email || 'Unknown',
              since: new Date().toLocaleString(),
              color: 'bg-danger text-white',
              actions: ['Request to unblock', 'Edit reason'],
              help: 'completeBlockByMobileNumber',
            };
            const updatedBlocks = [newBlock, ...(user.restrictions || [])];
            updateUser(user.id, { restrictions: updatedBlocks });
            setBlockConfirmed(true);
          }}>
            <p><strong>This account will be blocked from Wave.</strong><br />
              They will no longer be able to send, deposit, or withdraw money, or use the customer app.
            </p>

            <Form.Group className="mb-4">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                required
              />
              <Form.Text>Please specify why this account should be blocked. Include as much detail as possible.</Form.Text>
            </Form.Group>

            {blockConfirmed ? (
              <div className="alert alert-success d-flex justify-content-between align-items-center">
                User blocked successfully.
                <Button onClick={() => setShowBlockModal(false)}>Done</Button>
              </div>
            ) : (
              <div className="d-flex justify-content-end">
                <Button type="submit" className="btn btn-primary">Block User</Button>
              </div>
            )}
          </Form>
        </Modal.Body>
      </Modal>


      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Logging out user</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {logoutConfirmed ? (
            <>
              <div role="alert" className="fade alert alert-success show">
                User logged out
              </div>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="primary" onClick={() => setShowLogoutModal(false)}>Done</Button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-2">
                You are about to log out all devices of this user, do you want to continue?
              </p>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setLogoutConfirmed(true)}>
                  Log out {user.phone}
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showLimitsModal} onHide={() => setShowLimitsModal(false)} dialogClassName="modal-top modal-wide">
        <Modal.Header closeButton>
          <Modal.Title>
            User Limits<br />
            <small>{user.kyc2 ? 'KYC2' : 'KYC1'}, {new Date().toLocaleString('en-US', { month: 'long' })} Limit</small>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-warning d-flex align-items-center gap-3">
            <i className="bi bi-mortarboard-fill text-warning fs-4"></i>
            <span className="fw-bold">Please instruct the user how to check their own limits on the "Check limits" screen in the Settings of their customer app.</span>
          </div>

          {(() => {
            const inflowUsed = (user.transactions || []).reduce((total, tx) => {
              if (!tx.date || typeof tx.date !== 'string' || !tx.date.includes('/')) return total;

              const [day, month, yearAndTime] = tx.date.split('/');
              const [year, time] = yearAndTime.split(' ');
              const parsedDate = new Date(`${year}-${month}-${day} ${time}`);
              
              const now = new Date();
              const currentMonth = now.getMonth();
              const currentYear = now.getFullYear();
            
              if (
                parsedDate instanceof Date &&
                !isNaN(parsedDate) &&
                parsedDate.getMonth() === currentMonth &&
                parsedDate.getFullYear() === currentYear
              ) {
                return total + Math.abs(Number(tx.amount));
              }
              return total;
            }, 0);            

            const inflowRemaining = user.kyc2 ? 10000000 - inflowUsed : 200000 - inflowUsed;
            const maxInflow = user.kyc2 ? 10000000 : 200000;
            const maxBalance = user.kyc2 ? 2000000 : 200000;
            const balanceRemaining = maxBalance - user.balance;

            return (
              <>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">INFLOW</h5>
                        <h6 className="card-subtitle text-muted mb-2">Maximum allowed to deposit/receive today, but limited by max balance limit</h6>
                        <p className="card-text">
                          <strong>Remaining {new Date().toLocaleString('en-US', { month: 'long' })} inflow allowed: </strong>{inflowRemaining.toLocaleString()}F<br />
                          <strong>{new Date().toLocaleString('en-US',  { month: 'long' })} inflow used: </strong>{inflowUsed.toLocaleString()}F<br />
                          <strong>Maximum inflow limit: </strong>{maxInflow.toLocaleString()}F
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">BALANCE</h5>
                        <p className="card-text">
                          <strong>Remaining balance allowed: </strong>{balanceRemaining.toLocaleString()}F<br />
                          <strong>Current balance used: </strong>{user.balance.toLocaleString()}F<br />
                          <strong>Maximum balance limit: </strong>{maxBalance.toLocaleString()}F
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <strong>Message shown to the user:</strong>
                  <p>You have the highest limits available</p>
                </div>
              </>
            );
          })()}
        </Modal.Body>
      </Modal>

      <Modal show={showAwardCreditModal} onHide={() => setShowAwardCreditModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Award credit to {user.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {awardConfirmed ? (
            <div className="alert alert-success d-flex justify-content-between align-items-center">
              <span>Credit awarded successfully!</span>
              <Button onClick={() => setShowAwardCreditModal(false)}>Done</Button>
            </div>
          ) : (
            <Form onSubmit={(e) => {
              e.preventDefault();
              const amount = Number(awardAmount);
              if (!isNaN(amount) && amount > 0 && amount <= 1000 && awardReason) {
                const updatedBalance = Number(user.balance) + amount;
                const newTransaction = {
                  id: `TX${Math.floor(100000 + Math.random() * 900000)}`,
                  type: 'award_credit',
                  amount: amount,
                  date: new Date().toLocaleString(),
                  reason: `${awardReason}`,
                  balance: updatedBalance,
                };
                updateUser(user.id, {
                  balance: updatedBalance,
                  transactions: [newTransaction, ...(user.transactions || [])]
                });
                setAwardConfirmed(true);
              }
            }}>            
              <Form.Group className="mb-4">
                <Form.Label htmlFor="amount">Amount</Form.Label>
                <div className="input-group">
                  <span className="input-group-text" data-testid="currency">CFA</span>
                  <Form.Control
                    id="amount"
                    type="text"
                    value={awardAmount}
                    onChange={(e) => setAwardAmount(e.target.value)}
                    isInvalid={awardAmount && (isNaN(awardAmount) || Number(awardAmount) <= 0 || Number(awardAmount) > 1000)}
                  />
                </div>
                <Form.Text>Their new balance will be {(user.balance + (Number(awardAmount) || 0)).toLocaleString()}F</Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label htmlFor="reason">Reason</Form.Label>
                <Form.Control
                  id="reason"
                  type="text"
                  value={awardReason}
                  onChange={(e) => setAwardReason(e.target.value)}
                  isInvalid={!awardReason}
                />
                {!awardReason && <Form.Text className="text-danger">Please enter a reason</Form.Text>}
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!awardAmount || isNaN(awardAmount) || Number(awardAmount) <= 0 || Number(awardAmount) > 1000 || !awardReason}
                >
                  Award
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>



      <Modal show={showVaultModal} onHide={() => setShowVaultModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Vault account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="table table-borderless">
            <tbody>
              <tr>
                <th>
                  Vault balance{' '}
                  <span className={`text-uppercase badge ${user.vaultLocked ? 'bg-danger' : 'bg-success'} text-white`}>
                    {user.vaultLocked ? 'LOCKED' : 'UNLOCKED'}
                  </span>
                </th>
                <td>{Number(user.vaultBalance).toLocaleString()}F</td>
              </tr>
              <tr>
                <th>Main account balance</th>
                <td>{Number(user.balance).toLocaleString()}F</td>
              </tr>
            </tbody>
            <tbody>
              <tr>
                <th>Overall balance</th>
                <td>{(Number(user.balance) + Number(user.vaultBalance)).toLocaleString()}F</td>
              </tr>
              <tr>
                <th>Move Vault balance to Main account balance</th>
                <td>
                <Button
                  variant="outline-dark"
                  disabled={user.vaultLocked || user.vaultBalance <= 0}
                  onClick={() => setShowMoveConfirmModal(true)}
                >
                  Move balance
                </Button>
                </td>
              </tr>
              {user.vaultLocked && (
                <tr>
                  <td></td>
                  <td>Please unlock Vault before moving balance.</td>
                </tr>
              )}
            </tbody>
          </table>

          {user.vaultLocked && user.vaultLockedUntil && (
            <>
              <br />
              <big><b>Locked Vault</b></big>
              <br /><br />
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <th>Locked until</th>
                    <td align="right">
                      <span className="date">{formatDate(user.vaultLockedUntil)}</span>
                    </td>
                  </tr>
                  <tr>
                    <th></th>
                    <td align="right">
                    <Button variant="outline-dark" onClick={() => setShowUnlockConfirmModal(true)}>
                      Unlock Vault early
                    </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {user.vaultHistory?.length > 0 && (
            <>
              <big><b>Lock History</b></big>
              <table className="table">
                <tbody>
                {user.vaultHistory.map((entry, idx) => (
                  <tr key={idx}>
                    <td>
                      <div>
                        <b>Vault locked on {formatDate(entry.lockedOn)}</b>
                        <div style={{ paddingLeft: '0.5rem' }}>
                          Planned unlock date: {formatDate(entry.plannedUnlock)}
                          {entry.unlockedEarly && (
                            <div className="text-danger">
                              ⚠️ Unlocked early on {formatDate(entry.unlockedOn)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td align="right">{Number(entry.amount).toLocaleString()}F</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showUnlockConfirmModal} onHide={() => setShowUnlockConfirmModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Unlock Vault early?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This Vault will unlock on{' '}
            <strong>{formatDate(user.vaultLockedUntil)}</strong>. Are you sure you want to unlock it early?
          </p>

          <div className="text-danger mb-4">
            <strong>
              Please tell the user that if you unlock their vault now (or before the end of May), that they won’t be able to
              lock their Vault until June.
            </strong>
          </div>

          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              onClick={() => {
                handleUnlockVaultEarly();
                setShowUnlockConfirmModal(false);
              }}
            >
              Unlock Vault early
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showMoveConfirmModal} onHide={() => setShowMoveConfirmModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Vault Transfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Do you want to move the entire Vault balance to the main account?</p>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => setShowMoveConfirmModal(false)}>Cancel</Button>
            <Button variant="success" onClick={() => {
              handleMoveVaultToMain();
              setShowMoveConfirmModal(false);
            }}>
              Confirm Transfer
            </Button>
          </div>
        </Modal.Body>
      </Modal>


      <Modal show={showVisaModal} onHide={() => setShowVisaModal(false)} dialogClassName="modal-top modal-wide">
        <Modal.Header closeButton>
          <Modal.Title>Virtual Visa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex align-items-center justify-content-between border-bottom pb-1 mb-2">
            <p className="fw-semibold text-secondary mb-0">ACTIVE CARD</p>
            <div className="d-flex gap-2">
              {user.virtualVisaCard?.locked && (
                <Badge bg="secondary" className="text-uppercase">🔒 Locked</Badge>
              )}
              {user.virtualVisaCard?.blocked && (
                <Badge bg="danger" className="text-uppercase">🚫 Blocked</Badge>
              )}
            </div>
          </div>
          <br />

          {user.virtualVisaCard && user.virtualVisaCard.activated ? (
            <div className="virtual-card-box">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <th>Card balance</th>
                    <td align="right">{(user.virtualVisaCard.balance || 0).toLocaleString()}F</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td align="right">
                    <Button
                      variant="outline-dark"
                      disabled={!user.virtualVisaCard || user.virtualVisaCard.balance <= 0}
                      onClick={() => setShowVisaTransferModal(true)}
                    >
                      Move card balance to main account
                    </Button>
                    </td>
                  </tr>
                  <tr>
                    <th>Last 4 digits</th>
                    <td align="right">**** **** **** {user.virtualVisaCard.last4}</td>
                  </tr>
                  <tr>
                    <th>Expiry date</th>
                    <td align="right">{user.virtualVisaCard.expiry}</td>
                  </tr>
                  <tr>
                    <th>Date activated</th>
                    <td align="right">{user.virtualVisaCard.activatedDate}</td>
                  </tr>
                </tbody>
              </table>
              <br />
              <p className="fw-semibold text-secondary">Card actions</p>
              <div className="d-flex justify-content-between gap-2 pb-2">
                <Button variant="outline-danger" className="flex-grow-1" onClick={() => setShowDeleteCardModal(true)}>🗑️ Delete card</Button>
                {user.virtualVisaCard?.blocked ? (
                  <Button variant="primary" className="flex-grow-1" onClick={() => setShowBlockCardModal(true)}>🔓 Unblock card</Button>
                ) : (
                  <Button variant="primary" className="flex-grow-1" onClick={() => setShowBlockCardModal(true)}>🚫 Block card</Button>
                )}

                {user.virtualVisaCard?.locked ? (
                  <Button variant="primary" className="flex-grow-1" onClick={() => setShowLockCardModal(true)}>🔓 Unlock card</Button>
                ) : (
                  <Button variant="primary" className="flex-grow-1" onClick={() => setShowLockCardModal(true)}>🔒 Lock card</Button>
                )}
              </div>
            </div>
          ) : (
            <p>The customer does not have an active virtual visa card</p>
          )}

          <br />
          <p className="fw-semibold border-bottom pb-1 text-secondary">DELETED/EXPIRED CARDS</p>
          <br />

          {user.deletedVisaCards?.length > 0 ? (
            user.deletedVisaCards.map((card, index) => (
              <div key={index} className="mb-3">
                <p className="fw-bold">Card details **** {card.last4}</p>
                <div style={{ backgroundColor: '#f6f7f9', borderRadius: '10px', padding: '15px' }}>
                  <table className="table mb-0" style={{ backgroundColor: '#f6f7f9' }}>
                    <tbody>
                      <tr>
                        <th className="text-start">Last 4 digits</th>
                        <td className="text-end">**** **** **** {card.last4}</td>
                      </tr>
                      <tr>
                        <th className="text-start">Expiry date</th>
                        <td className="text-end">{card.expiry}</td>
                      </tr>
                      <tr>
                        <th className="text-start">Date activated</th>
                        <td className="text-end">{card.activatedDate}</td>
                      </tr>
                      <tr>
                        <th className="text-start">Date canceled or expired</th>
                        <td className="text-end">{card.canceledOn}</td>
                      </tr>
                      <tr>
                        <th className="text-start">Canceled by</th>
                        <td className="text-end">{card.canceledBy}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <p>No deleted or expired virtual cards</p>
          )}
        </Modal.Body>
      </Modal>


      <Modal show={showDeleteCardModal} onHide={() => setShowDeleteCardModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cardActionSuccess === 'Card deleted successfully' ? (
            <div className="alert alert-success d-flex justify-content-between align-items-center">
              <span>{cardActionSuccess}</span>
              <Button variant="primary" onClick={() => {
                setCardActionSuccess('');
                setShowDeleteCardModal(false);
              }}>Done</Button>
            </div>
          ) : (
            <>
              <p>This will permanently delete the active virtual Visa card.</p>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowDeleteCardModal(false)}>Cancel</Button>
                <Button variant="danger" onClick={() => {
                  const deleted = {
                    last4: user.virtualVisaCard.last4,
                    expiry: user.virtualVisaCard.expiry,
                    activated: user.virtualVisaCard.activated,
                    canceledOn: new Date().toLocaleDateString(),
                    canceledBy: authUser?.email || 'Support'
                  };
                  updateUser(user.id, {
                    virtualVisaCard: null,
                    deletedVisaCards: [deleted, ...(user.deletedVisaCards || [])]
                  });
                  setCardActionSuccess('Card deleted successfully');
                }}>Confirm</Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>


      <Modal show={showVisaTransferModal} onHide={() => {
        setShowVisaTransferModal(false);
        setTimeout(() => setVisaTransferSuccess(false), 300);
      }} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Transfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {visaTransferSuccess ? (
            <div className="alert alert-success d-flex justify-content-between align-items-center">
              <span>Card balance moved successfully!</span>
              <Button variant="primary" onClick={() => {
                setShowVisaTransferModal(false);
                setVisaTransferSuccess(false);
              }}>Done</Button>
            </div>
          ) : (
            <>
              <p>Do you want to move the entire card balance to the main account?</p>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowVisaTransferModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => {
                  const cardAmount = Number(user.virtualVisaCard?.balance || 0);
                  const updatedBalance = Number(user.balance || 0) + cardAmount;

                  const newTx = {
                    id: `TX${Math.floor(100000 + Math.random() * 900000)}`,
                    type: 'transferFromPaymentCardWalletEntry',
                    amount: cardAmount,
                    date: new Date().toLocaleString(),
                    balance: updatedBalance,
                    details: 'TransferFromPaymentCardWalletEntry',
                    title: 'Transfer from prepaid card'
                  };

                  updateUser(user.id, {
                    balance: updatedBalance,
                    virtualVisaCard: {
                      ...user.virtualVisaCard,
                      balance: 0
                    },
                    transactions: [newTx, ...(user.transactions || [])]
                  });

                  setVisaTransferSuccess(true);
                }}>Confirm Transfer</Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>


      <Modal show={showBlockCardModal} onHide={() => setShowBlockCardModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Block Card</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cardActionSuccess?.includes('Card blocked') || cardActionSuccess?.includes('Card unblocked') ? (
            <div className="alert alert-success d-flex justify-content-between align-items-center">
              <span>{cardActionSuccess}</span>
              <Button variant="primary" onClick={() => {
                setShowBlockCardModal(false);
                setTimeout(() => setCardActionSuccess(''), 300); // attendre la fermeture visuelle du modal
              }}>
                Done
              </Button>
            </div>
          ) : (
            <>
              {user.virtualVisaCard?.blocked ? (
                <p>This will <strong>unblock</strong> the virtual Visa card. It will become usable again for online payments.</p>
              ) : (
                <p>This will <strong>block</strong> the virtual Visa card. It will be unusable for online payments.</p>
              )}
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowBlockCardModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => {
                  updateUser(user.id, {
                    virtualVisaCard: {
                      ...user.virtualVisaCard,
                      blocked: !user.virtualVisaCard.blocked
                    }                    
                  });
                  setCardActionSuccess(user.virtualVisaCard?.blocked ? 'Card unblocked successfully' : 'Card blocked successfully');
                }}>{user.virtualVisaCard?.blocked ? 'Unblock' : 'Block'}</Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>


      <Modal show={showLockCardModal} onHide={() => setShowLockCardModal(false)} dialogClassName="modal-top">
        <Modal.Header closeButton>
          <Modal.Title>Lock Card</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cardActionSuccess?.includes('Card locked') || cardActionSuccess?.includes('Card unlocked') ? (
            <div className="alert alert-success d-flex justify-content-between align-items-center">
              <span>{cardActionSuccess}</span>
              <Button variant="primary" onClick={() => {
                setShowLockCardModal(false);
                setTimeout(() => setCardActionSuccess(''), 300);
              }}>
                Done
              </Button>
            </div>
          ) : (
            <>
              {user.virtualVisaCard?.locked ? (
                <p>This will <strong>unlock</strong> the virtual Visa card. It will become usable again.</p>
              ) : (
                <p>This will <strong>lock</strong> the virtual Visa card. It will be temporarily unusable.</p>
              )}
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowLockCardModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => {
                  updateUser(user.id, {
                    virtualVisaCard: {
                      ...user.virtualVisaCard,
                      locked: !user.virtualVisaCard.locked
                    }                    
                  });
                  setCardActionSuccess(user.virtualVisaCard?.locked ? 'Card unlocked successfully' : 'Card locked successfully');
                }}>{user.virtualVisaCard?.locked ? 'Unlock' : 'Lock'}</Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>


      <Modal show={showPhotoReviewModal} onHide={() => setShowPhotoReviewModal(false)} dialogClassName="modal-xl">
        <Modal.Header closeButton>
          <Modal.Title>KYC Sénégal 🇸🇳</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {user?.merchant && (
            <div className="alert alert-info text-center">
              Cet utilisateur est principal pour le marchand: <a href="#">{user?.merchant?.businessName} ({user?.merchant?.id})</a>
            </div>
          )}
          <div className="alert alert-warning text-center">
            Ce client a précédemment été accepté ( | | | | )
          </div>

          <div className="row mb-4">
            <div className="col-md-6 text-center">
              <h6>Pièce d'identité recto</h6>
              <div className="btn-toolbar photo-controls justify-content-center mb-2" role="toolbar">
                <div className="btn-group me-1" role="group">
                  <button className="btn btn-success accept" title="Accepter" disabled><i className="bi bi-check"></i></button>
                  <button className="btn btn-light edit-button" title="Éditer" disabled>Edit</button>
                  <button className="btn btn-light clear-button" title="Effacer" disabled>Clear</button>
                </div>
                <div className="btn-group" role="group">
                  <button className="btn btn-danger" title="Illisible" disabled><i className="bi bi-cloud-haze2-fill"></i></button>
                  <button className="btn btn-danger" title="Pas carte" disabled><i className="bi bi-image-fill"></i></button>
                  <button className="btn btn-danger" title="Expiré" disabled><i className="bi bi-calendar2-x"></i></button>
                  <button className="btn btn-danger" title="Photo d'une photo" disabled><i className="bi bi-camera-fill"></i></button>
                  <button className="btn btn-danger" title="Identités multiples" disabled><i className="bi bi-people-fill"></i></button>
                  <button className="btn btn-danger" title="Document incomplet" disabled><i className="bi bi-book-half"></i></button>
                  <button className="btn btn-danger" title="Mauvais document" disabled><i className="bi bi-x-square"></i></button>
                  <button className="btn btn-danger" title="Visage non reconnaissable" disabled><i className="bi bi-emoji-expressionless-fill"></i></button>
                </div>
              </div>
              <img
                src={user?.idFrontUrl || "https://via.placeholder.com/300x200?text=ID+Front"}
                className="img-fluid border rounded"
                alt="ID Front"
                style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }}
              />
            </div>

            <div className="col-md-6 text-center">
              <h6>Pièce d'identité verso</h6>
              <div className="btn-toolbar photo-controls justify-content-center mb-2" role="toolbar">
                <div className="btn-group me-1" role="group">
                  <button className="btn btn-success accept" title="Accepter" disabled><i className="bi bi-check"></i></button>
                  <button className="btn btn-light edit-button" title="Éditer" disabled>Edit</button>
                  <button className="btn btn-light clear-button" title="Effacer" disabled>Clear</button>
                </div>
                <div className="btn-group" role="group">
                  <button className="btn btn-danger" title="Illisible" disabled><i className="bi bi-cloud-haze2-fill"></i></button>
                  <button className="btn btn-danger" title="Pas carte" disabled><i className="bi bi-image-fill"></i></button>
                  <button className="btn btn-danger" title="Expiré" disabled><i className="bi bi-calendar2-x"></i></button>
                  <button className="btn btn-danger" title="Photo d'une photo" disabled><i className="bi bi-camera-fill"></i></button>
                  <button className="btn btn-danger" title="Identités multiples" disabled><i className="bi bi-people-fill"></i></button>
                  <button className="btn btn-danger" title="Document incomplet" disabled><i className="bi bi-book-half"></i></button>
                  <button className="btn btn-danger" title="Mauvais document" disabled><i className="bi bi-x-square"></i></button>
                  <button className="btn btn-danger" title="Visage non reconnaissable" disabled><i className="bi bi-emoji-expressionless-fill"></i></button>
                </div>
              </div>
              <img
                src={user?.idBackUrl || "https://via.placeholder.com/300x200?text=ID+Back"}
                className="img-fluid border rounded"
                alt="ID Back"
                style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }}
              />
            </div>
          </div>

          <hr />

          <Form className="mt-3">
            <div className="row">
              <Form.Group className="col-md-3">
                <Form.Label>Type de document</Form.Label>
                <Form.Select value="SN_NATIONAL_ID" disabled>
                  <option value="SN_NATIONAL_ID">SN_NATIONAL_ID</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="col-md-3">
                <Form.Label>Numéro d'identité</Form.Label>
                <Form.Control type="text" value={user?.idNumber || ''} disabled />
              </Form.Group>
              <Form.Group className="col-md-3">
                <Form.Label>Prénoms</Form.Label>
                <Form.Control type="text" value={user?.name?.split(' ')[0] || ''} disabled />
              </Form.Group>
              <Form.Group className="col-md-3 d-flex flex-column">
                <Form.Label>Nom de famille</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control type="text" value={user?.name?.split(' ')[1] || ''} disabled />
                  <Button variant="info" disabled>Search</Button>
                </div>
              </Form.Group>
            </div>

            <div className="row mt-2">
              <Form.Group className="col-md-3">
                <Form.Label>Autres noms</Form.Label>
                <Form.Control type="text" value={user?.otherNames || ''} disabled />
              </Form.Group>
              <Form.Group className="col-md-3">
                <Form.Label>Sexe</Form.Label>
                <Form.Select value={user?.gender || 'M'} disabled>
                  <option value="M">M</option>
                  <option value="F">F</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="col-md-3">
                <Form.Label>Date de naissance</Form.Label>
                <Form.Control type="text" value={user?.dob || ''} disabled />
              </Form.Group>
              <Form.Group className="col-md-3 d-flex flex-column">
                <Form.Label>Expiry date</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control type="text" value={user?.expiryDate || ''} disabled />
                  <Button variant="primary" disabled>Accepter</Button>
                </div>
              </Form.Group>
            </div>

            <div className="row mt-3">
              <div className="col-md-12">
                {user?.legalEntityUrl && (
                  <div>
                    <span>Legal Entity Page: <a href={user.legalEntityUrl}>🛂 {user.name}</a></span><br />
                  </div>
                )}
                {user?.kycAuditTrailUrl && (
                  <div>
                    <span>KYC Audit Trail: <a href={user.kycAuditTrailUrl}>🎞️ {user.kycAuditTrailId}</a></span><br />
                  </div>
                )}
                {user?.wallet && (
                  <div>
                    Wallet: <a href={user.wallet.url}><img src="/static/wave-support.png" alt="Wave Support logo" className="inline-front-logo" /> {user.wallet.label}</a><br />
                  </div>
                )}
                {user?.otherWallets?.length > 0 && (
                  <div>
                    Other wallets ({user.otherWallets.length}):
                    <ul>
                      {user.otherWallets.map((w, idx) => (
                        <li key={idx} className="ms-4">
                          <a href={w.url}><img src="/static/wave-support.png" alt="Wave Support logo" className="inline-front-logo" /> {w.label}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {user?.selfGivenName && (
                  <div>Self-given name: <b>{user.selfGivenName}</b></div>
                )}
              </div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>


    </div>
  );
};

export default PersonalPanel;
