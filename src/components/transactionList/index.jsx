import React, { useEffect, useRef, useState } from 'react';
import { Dropdown, Modal, Form, Button } from 'react-bootstrap';
import { useUserContext } from '../../utils/UserContext';

const TransactionList = ({ transactions, authUser }) => {
  const {
    selectedUser,
    setSelectedUser,
    updateUser,
    highlightedTransactionId,
    setHighlightedTransactionId,
    users
  } = useUserContext();  

  const txRefs = useRef({});
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [txToRefund, setTxToRefund] = useState(null);

  const [refundSuccess, setRefundSuccess] = useState(false);

  const [showRefundDisputeModal, setShowRefundDisputeModal] = useState(false);

  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  const [billPaySubmitted, setBillPaySubmitted] = useState(false);

  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showBillPayProblemModal, setShowBillPayProblemModal] = useState(false);

  const [showFreezeWithdrawalModal, setShowFreezeWithdrawalModal] = useState(false);
  const [withdrawFreezeError, setWithdrawFreezeError] = useState(null);

  const [showFreezeDepositModal, setShowFreezeDepositModal] = useState(false);
  const [depositFreezeError, setDepositFreezeError] = useState(null);

  const [showMerchantIssueModal, setShowMerchantIssueModal] = useState(false);
  const [merchantIssueSubmitted, setMerchantIssueSubmitted] = useState(false);
  

  useEffect(() => {
    if (highlightedTransactionId && txRefs.current[highlightedTransactionId]) {
      txRefs.current[highlightedTransactionId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedTransactionId]);

  const handleUserClick = (userPhone, txId, targetTab = 'personal') => {
    setSelectedUser(userPhone, txId, targetTab);
  };

  const handleRefund = (tx) => {
    setTxToRefund(tx);
    setShowRefundModal(true);
  };

  const hasOutgoingTransactionsAfter = (recipient, txDateStr) => {
    if (!recipient?.transactions?.length) return false;
  
    const txTime = parseCustomDate(txDateStr).getTime();
  
    return recipient.transactions.some(tx => {
      const txTimeOut = parseCustomDate(tx.date).getTime();
      if (txTimeOut <= txTime) return false;
  
      const isOutgoing = ['transfer', 'payment', 'withdrawal', 'bill_payment'].includes(tx.type) && tx.amount < 0;
      return isOutgoing;
    });
  };
  
  const isRefundEligible = (recipient, txDate, amount) => {
    const balance = recipient?.balance || 0;
    const refundAmount = Math.abs(amount);
  
    if (balance === 0) {
      return 'danger'; // Cas 1 : aucun fonds dispo
    }
  
    const hasOutgoing = hasOutgoingTransactionsAfter(recipient, txDate);
  
    if (hasOutgoing) {
      return 'warning'; // Cas 2 : il y a eu des sorties de fonds → jamais vert
    }
  
    if (balance < refundAmount) {
      return 'warning'; // Cas 3 : fonds partiels seulement
    }
  
    return 'success'; // Cas 4 : fonds entièrement dispo, aucune sortie
  };  


  const areFundsAvailable = (recipient, amount) => {
    if (!recipient) return false;
    return (recipient.balance || 0) >= Math.abs(amount);
  };

  const processRefund = () => {
    if (!txToRefund) return;
  
    const sender = selectedUser;
    const recipient = users.find(u => u.phone === txToRefund.highlight?.phone);
    if (!recipient) return;
  
    const now = new Date();
    const iso = now.toISOString(); // horodatage technique
    const readable = now.toLocaleString('fr-FR'); // horodatage lisible pour affichage
    const authEmail = authUser?.email || 'support@wave.com';
  
    const originalTxId = txToRefund.id;
    const refundAmountRequested = Math.abs(txToRefund.amount);
    const recipientBalance = recipient.balance || 0;
  
    // ✅ Calcul du montant remboursable
    const refundAmount = Math.min(refundAmountRequested, recipientBalance);
    if (refundAmount <= 0) return;
  
    // ✅ Transaction de remboursement côté sender
    const reversalSenderTx = {
      id: `REV_${originalTxId}`,
      type: 'reversalEntry',
      amount: refundAmount,
      date: iso,
      readableDate: readable,
      balance: sender.balance + refundAmount,
      details: 'TransferSentReversalEntry',
      reversedBy: authEmail,
      originalTxId,
      highlight: { name: recipient.name, phone: recipient.phone }
    };
  
    // ✅ Transaction de remboursement côté recipient
    const reversalRecipientTx = {
      id: `REV_${originalTxId}`,
      type: 'reversalEntry',
      amount: -refundAmount,
      date: iso,
      readableDate: readable,
      balance: recipientBalance - refundAmount,
      details: 'TransferReceivedReversalEntry',
      reversedBy: authEmail,
      originalTxId,
      highlight: { name: sender.name, phone: sender.phone }
    };
  
    // ✅ Marquer la transaction originale comme remboursée
    const updateTxWithReversed = (txList, txId, reversedDate) =>
      txList.map(tx =>
        tx.id === txId
          ? { ...tx, reversed: true, reversedAt: reversedDate }
          : tx
      );
  
    // ✅ Mettre à jour le sender
    updateUser(sender.id, {
      balance: sender.balance + refundAmount,
      transactions: [
        reversalSenderTx,
        ...updateTxWithReversed(sender.transactions || [], originalTxId, iso)
      ]
    });
  
    // ✅ Mettre à jour le recipient
    updateUser(recipient.id, {
      balance: recipientBalance - refundAmount,
      transactions: [
        reversalRecipientTx,
        ...updateTxWithReversed(recipient.transactions || [], originalTxId, iso)
      ]
    });
  
    setRefundSuccess(true);
  };
  
  

  const [freezeError, setFreezeError] = useState(null); // à ajouter dans ton useState

  const processFreeze = (reason) => {
    const now = new Date();
    const iso = now.toISOString();
    const readable = now.toLocaleString('en-GB');
    const authEmail = authUser?.email || 'support@wave.com';
  
    const frozenNote = {
      frozen: true,
      frozenBy: authEmail,
      frozenAt: iso,
      frozenReason: reason
    };
  
    // 🔍 Identifier les deux utilisateurs concernés
    const usersInvolved = users.filter(u =>
      (u.transactions || []).some(tx =>
        tx.id === selectedTx.id || tx.originalTxId === selectedTx.id || tx.originalTxId === selectedTx.originalTxId
      )
    );
  
    let canFreeze = true;
    let freezeAmountsByUserId = {};
  
    // 🧠 Vérification préalable pour déterminer les montants gelables
    usersInvolved.forEach(user => {
      const isSender = user.transactions.some(
        tx => tx.amount > 0 && tx.originalTxId === selectedTx.originalTxId
      );
  
      const currentBalance = user.balance || 0;
      const originalAmount = Math.abs(selectedTx.amount);
      const amountToFreeze = isSender ? Math.min(currentBalance, originalAmount) : 0;
  
      if (isSender && amountToFreeze === 0) {
        canFreeze = false; // ❌ aucun fond dispo, on bloque
      }
  
      freezeAmountsByUserId[user.id] = amountToFreeze;
    });
  
    if (!canFreeze) {
      setFreezeError("Freeze impossible : l’expéditeur n’a plus suffisamment de fonds.");
      return;
    }
  
    // ✅ Application du freeze
    usersInvolved.forEach(user => {
      const isSender = user.transactions.some(
        tx => tx.amount > 0 && tx.originalTxId === selectedTx.originalTxId
      );
  
      const amountToFreeze = freezeAmountsByUserId[user.id];
  
      const updatedTxList = user.transactions.map(tx =>
        tx.id === selectedTx.id || tx.originalTxId === selectedTx.id || tx.originalTxId === selectedTx.originalTxId
          ? { ...tx, ...frozenNote }
          : tx
      );
  
      const updatedData = {
        transactions: isSender
          ? [
              {
                id: `FRZ_NOTICE_${selectedTx.id}`,
                type: 'freeze_notice',
                date: iso,
                readableDate: readable,
                originalTxId: selectedTx.id,
                amount: -amountToFreeze,
              },
              ...updatedTxList
            ]
          : updatedTxList,
        balance: isSender
          ? (user.balance || 0) - amountToFreeze
          : user.balance
      };
  
      updateUser(user.id, updatedData);
    });
  
    setShowFreezeModal(false);
    setFreezeError(null);
  };  
  

  const getDropdownOptions = (tx) => {
    switch (tx.type) {
      case 'payment':
        return [
          { label: 'Report Customer Scam', disabled: true },
          { label: 'Refund', disabled: true },
          { label: 'Escalate to Support Group Lead', action: () => { setSelectedTx(tx); setShowEscalateModal(true); } },
          {
            label: 'Report Merchant Issue', 
            action: () => {
              setSelectedTx(tx);
              setShowMerchantIssueModal(true); // ✅ Utilise le bon state
            }
          }          
        ];
      case 'withdrawal':
        return [
          { label: 'Report Customer Scam', disabled: true },
          { label: 'Escalate to Support Group Lead', action: () => { setSelectedTx(tx); setShowEscalateModal(true); } },
          { 
            label: 'Freeze withdrawal', 
            action: () => {
              setSelectedTx(tx);
              setShowFreezeWithdrawalModal(true); // nouveau modal
            },
            disabled: tx.frozen 
          },
        ];
        case 'transfer':
          return [
            {
              label: 'Refund',
              action: () => {
                setTxToRefund(tx);
                setShowRefundModal(true);
              },
              disabled: tx.amount > 0 || tx.reversed
            },
            { label: 'Change recipient', disabled: true },
            { label: 'Freeze transaction', disabled : true },
            {
              label: 'Escalate to Support Group Lead',
              action: () => {
                setSelectedTx(tx);
                setShowEscalateModal(true);
              }
            },
            { label: 'Report Customer Scam', disabled: true },
            {
              label: 'Report Refunding Dispute',
              action: () => {
                setSelectedTx(tx);
                setShowRefundDisputeModal(true);
              }
            },                        
            { label: 'Block recipient', disabled: true },
          ];        
      case 'deposit':
        return [
          { label: 'Escalate to Support Group Lead', action: () => { setSelectedTx(tx); setShowEscalateModal(true); } },
          { 
            label: 'Freeze deposit', 
            action: () => {
              setSelectedTx(tx);
              setShowFreezeDepositModal(true); // 💡 Nouveau modal
            },
            disabled: tx.frozen
          },
        ];
      case 'bill_payment':
        return [
          { label: 'Report Customer Scam', disabled: true },
          { 
            label: 'Report Bill Pay Problem',
            action: () => {
              setSelectedTx(tx);
              setShowBillPayProblemModal(true);
            }
          },
        ];
      case 'award_credit':
        return [
          { label: 'No actions available', disabled: true }
        ];
      case'reversalEntry':
        return [
          { 
            label: 'Freeze transaction', 
            action: () => {
              setSelectedTx(tx);
              setShowFreezeModal(true);
            },
            disabled: tx.frozen // désactiver si déjà gelée
          },
          {
            label: 'Report Refunding Dispute',
            action: () => {
              setSelectedTx(tx);
              setShowRefundDisputeModal(true);
            }
          }                  
        ]
      case 'transferToPaymentCardWalletEntry':
      case 'transferFromPaymentCardWalletEntry':
        return [
          { label: 'No actions available', disabled: true }
        ];    
        
      case 'agent_deposit':
        return [
          { label: 'Report Agent Scam', disabled: true },
          { label: 'Escalate to Support Group Lead', action: () => { setSelectedTx(tx); setShowEscalateModal(true); } },
        ];
      case 'agent_withdrawal':
        return [
          { label: 'Escalate to Support Group Lead', action: () => { setSelectedTx(tx); setShowEscalateModal(true); } },
        ];
      case 'freeze_notice':
        return [
          {
            label: 'Report Refunding Dispute',
            action: () => {
              setSelectedTx(tx);
              setShowRefundDisputeModal(true);
            }
          }
        ];
      case 'merchant_payment': 
        return [
          {
            label: 'Report Merchant Issue', 
            action: () => {
              setSelectedTx(tx);
              setShowMerchantIssueModal(true); // ✅ Utilise le bon state
            }
          }          
        ];
      default:
        return [{ 
          label: 'No actions available', disabled: true }];
    }
  };

  const getTxTitle = (tx) => {
    switch (tx.type) {
      case 'bill_payment':
        return `Bill payment, ${tx.billType || 'unknown'}`;
      case 'withdrawal':
        return 'Withdraw';
      case 'payment':
        return (
          <>
            Payment to{' '}
            <span
              className="text-primary text-decoration-underline cursor-pointer"
              onClick={() => handleUserClick(tx.merchantPhone, tx.id, 'merchant')}
            >
              {tx.merchant || 'merchant'}
            </span>
          </>
        );
      case 'transfer': {
        const isReceived = tx.amount > 0;
        const direction = isReceived ? 'From' : 'To';
        return (
          <>
            {direction}{' '}
            <span
              className="text-primary text-decoration-underline cursor-pointer"
              onClick={() => handleUserClick(tx.highlight?.phone, tx.id)}
            >
              {tx.highlight?.name || 'user'}: {tx.highlight?.phone || ''}
            </span>
          </>
        );
      }
      case 'reversalEntry': {
        return (
          <>
            Transaction ID <a className="text-primary text-decoration-underline">
              {tx.originalTxId}
            </a> Reversed by {tx.reversedBy} via support app{' '}
            {tx.frozen && (
              <>
                <span role="img" aria-label="justice">⚖️</span>{' '}
                <span role="img" aria-label="snowflake">❄️</span>{' '}
                <strong>Transaction is frozen</strong>
              </>
            )}
          </>
        );
      }               
      
      case 'merchant_payment':
        return (
          <>
            Payment from{' '}
            <span
              className="text-primary text-decoration-underline cursor-pointer"
              onClick={() => handleUserClick(tx.customerPhone, tx.id)}
            >
              {tx.customer}: {tx.customerPhone}
            </span>
          </>
        );
      case 'deposit':
        return 'Deposit';
      case 'award_credit':
        return <>Awarded Credit</>;
      case 'agent_withdrawal':
        return `Withdraw (by ${selectedUser.name || 'Agent'})`;
      case 'agent_deposit':
        return `Deposit (by ${selectedUser.name || 'Agent'})`;
      case 'transferToVault':
        return 'Transfer to Vault';

      case 'transferFromVault':
        return 'Transfer from Vault';
      case 'transferToPaymentCardWalletEntry':
        return 'Transfer to prepaid card';
      case 'transferFromPaymentCardWalletEntry':
        return 'Transfer from prepaid card';    
        
      case 'freeze_notice':
        return (
          <>
            Funds temporarily frozen by Wave - Original transfer:{' '}
            <a className="text-primary text-decoration-underline">
              {tx.originalTxId}
            </a>
          </>
        );
        
      default:
        return tx.titleStart || 'Transaction';
    }
  };

  const getTxDetails = (tx) => {
    
    // ✅ Cas refund "entrant" (reversalEntry reçu)
    if (tx.reversed && tx.originalTxId) {
      return `T_${tx.originalTxId} (reversed: ${tx.readableDate})`;
    }
  
    // ✅ Cas refund "sortant" (transfert original marqué reversed)
    if ((tx.type === 'transfer' || tx.type === 'payment') && tx.reversed) {
      const reversedDate = tx.reversedAt
        ? new Date(tx.reversedAt).toLocaleString('en-GB')
        : 'unknown date';
    
      return `T_${tx.id} (reversed: ${reversedDate})`;
    }    
  
    // ✅ Cas normal
    if (tx.type === 'transfer' || tx.type === 'payment') {
      return `T_${tx.id}`;
    }
  
    if (tx.type === 'bill_payment' && tx.billType === 'Airtime') {
      return `Mobile number: ${tx.recipient || ''}\nT_${tx.id || ''}\nBought airtime for ${tx.recipient}, partner Tx ID: R${tx.partnerId || tx.id || 'XXXXXX'}`;
    }

    if (tx.type === 'bill_payment' && tx.billType === 'Woyofal') {
      return `Meter Number: ${tx.recipient}
    Woyofal code: ${tx.token} (${tx.kwh} kWh)
    Partner Tx ID: ${tx.partnerId}
    Token: ${tx.tokenRaw}`;
    }    
  
    if (tx.type === 'withdrawal' && tx.agent && tx.id) {
      return (
        <span>
          ATX_{tx.id} at{' '}
          <span
            className="text-primary text-decoration-underline cursor-pointer"
            onClick={() => handleUserClick(tx.agentPhone, tx.id, 'agent')}
          >
            {tx.agent}
          </span>
        </span>
      );
    }
  
    if (tx.type === 'deposit') {
      return (
        <span>
          ATX_{tx.id} at{' '}
          <span
            className="text-primary text-decoration-underline cursor-pointer"
            onClick={() => handleUserClick(tx.agentPhone, tx.id, 'agent')}
          >
            {tx.agent || 'agent'}
          </span>
        </span>
      );
    }
  
    if (tx.type === 'merchant_payment') {
      return `T_${tx.id || ''} : MERCHANT_SCAN`;
    }
  
    if (tx.details) return tx.details;
  
    if (tx.type === 'award_credit') {
      return `Reason: ${tx.reason}`;
    }
  
    if (tx.type === 'agent_withdrawal' || tx.type === 'agent_deposit') {
      return (
        <span>
          ATX_{tx.id} for{' '}
          <span
            className="text-primary text-decoration-underline cursor-pointer"
            onClick={() => handleUserClick(tx.userPhone, tx.id)}
          >
            {tx.user}: {tx.userPhone}
          </span>
        </span>
      );
    }
  
    if (tx.type === 'reversalEntry') {
      return 'TransferSentReversalEntry';
    }

    if (tx.type === 'transferToVault') {
      return 'TransferToSavingsEntry';
    }
    
    if (tx.type === 'transferFromVault') {
      return 'TransferFromSavingsEntry';
    }    

    if (
      tx.type === 'transferToPaymentCardWalletEntry' ||
      tx.type === 'transferFromPaymentCardWalletEntry'
    ) {
      return tx.type === 'transferToPaymentCardWalletEntry'
        ? 'TransferToPaymentCardWalletEntry'
        : 'TransferFromPaymentCardWalletEntry';
    }    
  
    return '';
  };
  

  const formatAmount = (amount) => {
    return Number(amount)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseCustomDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return new Date(); // fallback
  
    const parts = dateStr.trim().split(' ');
    if (parts.length < 2) return new Date(dateStr);
  
    const [day, month, year] = parts[0].split('/');
    let time = parts[1];
  
    const [h, m, s] = time.split(':');
    const paddedTime = [
      h.padStart(2, '0'),
      m.padStart(2, '0'),
      s.padStart(2, '0'),
    ].join(':');
  
    return new Date(`${year}-${month}-${day}T${paddedTime}`);
  };  

  const handleRefundDisputeSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const comments = e.target.elements.comments.value;
  
    const now = new Date();
    const ticketId = `TK${Math.random().toString(36).substring(2, 10).toUpperCase()}_SN0`;
    const raisedBy = authUser?.email || 'support@wave.com';
  
    const note = {
      type: 'refunding_dispute',
      date: now.toISOString(),
      raisedBy,
      status: 'OPEN',
      transactionId: selectedTx?.id,
      description: comments,
      ticketId
    };
  
    // 🔍 On cherche tous les utilisateurs qui ont cette transaction ou une liée
    const relatedUsers = users.filter(u =>
      (u.transactions || []).some(tx =>
        tx.id === selectedTx?.id || tx.originalTxId === selectedTx?.id || tx.originalTxId === selectedTx?.originalTxId
      )
    );
  
    relatedUsers.forEach(user => {
      const updatedHistory = [...(user.userHistory || []), note];
      updateUser(user.id, { userHistory: updatedHistory });
    });
  
    setDisputeSubmitted(true);
  };  

  return (
    <div className="transaction-list p-3 pt-0">
      {[...transactions]
          .sort((a, b) => parseCustomDate(b.date) - parseCustomDate(a.date))
          .map((tx, idx) => (
          <div
            key={idx}
            ref={el => txRefs.current[tx.id] = el}
            className={`transaction-row py-1 pr-12 pl-2 border-bottom border-gray-200 group ${
              tx.type === 'freeze_notice'
                ? 'bg-info-subtle'
                : tx.id === highlightedTransactionId
                  ? 'bg-warning-subtle'
                  : ''
            }`}
          >
            <div>
              <div className="float-end d-flex align-items-center">
                <span className="amount">
                  {tx.amount >= 0
                    ? `${formatAmount(parseFloat(tx.amount).toFixed(0))}F`
                    : `-${formatAmount(Math.abs(parseFloat(tx.amount)).toFixed(0))}F`}
                </span>
                <Dropdown>
                  <Dropdown.Toggle size="sm" variant="light" className="border border-dark rounded px-2 py-0 ms-2" />
                  <Dropdown.Menu>
                    {getDropdownOptions(tx).map((option, i) => (
                      <Dropdown.Item
                        key={i}
                        disabled={option.disabled}
                        onClick={!option.disabled ? option.action : undefined}
                    >
                        {option.label}
                    </Dropdown.Item>                    
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div style={{ fontWeight: '400' }}>
                {getTxTitle(tx)}
                {tx.frozen && <span className="badge bg-danger ms-2">Frozen</span>}
              </div>
              <div className="tx-details" style={{ whiteSpace: 'pre-line' }}>{getTxDetails(tx)}</div>
              {typeof tx.balance !== 'undefined' && (
                <div className="balance-hover">
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                    bal: {formatAmount(tx.balance)}F
                  </span>
                </div>
              )}
              {tx.date && (
                <div>
                  <i>
                    <span className="date">
                      {tx.readableDate
                        ? tx.readableDate
                        : /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)$/.test(tx.date)
                        ? new Date(tx.date).toLocaleString('en-GB')
                        : tx.date}
                    </span>
                  </i>
                </div>
              )}
            </div>
          </div>
        ))}

        <Modal
          show={showEscalateModal}
          onHide={() => setShowEscalateModal(false)}
          onExited={() => setSubmitted(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Escalate to Support Group Lead</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {!submitted ? (
              <Form autoComplete="off" onSubmit={(e) => {
                e.preventDefault();

                const issueValue = e.target.elements.problem.value;
                if (!issueValue) return;

                const newTicket = {
                  date: new Date().toISOString(),
                  status: 'Open',
                  clickupId: `CU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
                  issue: issueValue,
                  ticketId: `T-${selectedTx?.id}`,
                };

                const updatedHistory = [...(selectedUser.escalationHistory || []), newTicket];

                updateUser(selectedUser.id, { escalationHistory: updatedHistory });
                setSubmitted(true); // ✅ Affiche le message de succès
              }}>
                <Form.Group className="mb-4">
                  <Form.Label>Customer mobile</Form.Label>
                  <Form.Control type="text" readOnly value={selectedUser?.phone || ''} />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Comments</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    name="comments"
                    defaultValue={`[What]: \n[Why]: \n[Transaction ID]: ATX_${selectedTx?.id}\n[Amount]: CFA ${selectedTx?.amount}\n[Agent]: ${selectedTx?.agent || '—'}\n[Customer]: ${selectedUser?.phone || ''}\n[Type]: ${selectedTx?.type?.toUpperCase() || ''}`}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Issue</Form.Label>
                  <Form.Select required name="problem">
                    <option value=""> Select an issue</option>
                    <option value="ATX_CORRECTION"> ATX correction</option>
                    <option value="MOVE_BALANCE_REQUEST"> Move balance request</option>
                    <option value="LANGUAGE_CALLBACK"> Language callback</option>
                    <option value="REFUND_QUESTION"> Refund question</option>
                    <option value="B2W_DEVICE_LINKING"> B2W device linking</option>
                    <option value="OTHER"> Other</option>
                  </Form.Select>
                  <Form.Text className="text-muted">Please select an issue</Form.Text>
                </Form.Group>

                <Button type="submit" variant="primary" className="float-end">Send</Button>
                <div className="clearfix"></div>
              </Form>
            ) : (
              <>
                <div className="alert alert-success fade show mt-3">
                  Success! The escalation has been submitted to the Support Group Lead.
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <Button variant="primary" onClick={() => setShowEscalateModal(false)}>
                    Done
                  </Button>
                </div>
              </>
            )}

            <hr />
            <p>History of Escalations</p>
            <div className="table-responsive" style={{ fontSize: "13px" }}>
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
                  {(selectedUser.escalationHistory || []).length > 0 ? (
                    selectedUser.escalationHistory.map((ticket, index) => (
                      <tr key={index}>
                        <td>{new Date(ticket.date).toLocaleString('en-GB')}</td>
                        <td>{ticket.status}</td>
                        <td>{ticket.clickupId}</td>
                        <td>{ticket.issue}</td>
                        <td>{ticket.ticketId}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} align="center">No escalations</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Modal.Body>
        </Modal>

        <Modal
          show={showRefundModal}
          onHide={() => setShowRefundModal(false)}
          onExited={() => {setRefundSuccess(false); setShowFreezeModal(false); setFreezeError(null);}}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Refund {Math.abs(txToRefund?.amount || 0).toLocaleString()}F to {txToRefund?.highlight?.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {!refundSuccess ? (() => {
                const recipient = users.find(u => u.phone === txToRefund?.highlight?.phone);
                const status = isRefundEligible(recipient, txToRefund?.date, txToRefund?.amount);

                console.log(recipient)

                const messages = {
                  danger: {
                    className: 'alert-danger',
                    message: 'Funds are not available.'
                  },
                  warning: {
                    className: 'alert-warning',
                    message: "The recipient has made outgoing transactions since the transfer. Please verify the transaction history below before making a refund decision."
                  },
                  success: {
                    className: 'alert-success',
                    message: "Funds are available, there haven't been any outgoing transactions, and the wallet has no blocks."
                  }
                };

                return (
                  <>
                    <p className="mb-2">
                      Refund {Math.abs(txToRefund?.amount || 0).toLocaleString()}F to {txToRefund?.highlight?.name} ({txToRefund?.highlight?.phone})?
                    </p>
                    <div className={`alert fade show mt-3 ${messages[status].className}`}>
                      <p>{messages[status].message}</p>
                    </div>
                    {status === 'warning' && recipient && (
                      <div className="mt-4">
                        <strong>Transactions of {recipient.name}</strong>
                        <div style={{display: 'flex', flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px'}}>
                          <div>Current balance : </div>
                          <div className='amount'>{formatAmount(recipient.balance)}F</div>
                        </div>
                        <div className="border rounded p-2" style={{ maxHeight: 250, overflowY: 'auto' }}>
                          {recipient.transactions
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((t, index) => (
                              <div
                                key={index}
                                className={`transaction-row py-1 pr-12 pl-2 border-bottom border-gray-200 group position-relative
                                  ${t.id === txToRefund?.id ? 'bg-warning-subtle' : ''}
                                  ${t.frozen ? 'bg-danger-subtle' : ''}
                                `}
                              >
                                <div>
                                  <div className="float-end d-flex align-items-center">
                                    <span className="amount">
                                      {t.amount >= 0
                                        ? `${formatAmount(t.amount)}F`
                                        : `-${formatAmount(Math.abs(t.amount))}F`}
                                    </span>
                                  </div>

                                  <div style={{fontWeight: '400' }}>{getTxTitle(t)}</div>
                                  <div className="tx-details text-muted" style={{ whiteSpace: 'pre-line', fontSize: '0.85rem' }}>{getTxDetails(t)}</div>

                                  {t.date && (
                                    <div style={{fontSize: '0.9rem' }}>
                                      <i className="date">{parseCustomDate(t.date).toLocaleString('en-GB')}</i>
                                    </div>
                                  )}
                                  {typeof t.balance !== 'undefined' && (
                                    <div className="balance-hover" style={{right: '0px'}}>
                                      <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                                        bal: {formatAmount(t.balance)}F
                                      </span>
                                    </div>                                  
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    <div className="d-flex justify-content-between mt-4">
                      <Button variant="danger" onClick={() => setShowRefundModal(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={processRefund} disabled={status === 'danger'}>
                        Refund
                      </Button>
                    </div>

                    {freezeError && (
                      <div className="text-danger fw-semibold mb-3">
                        {freezeError}
                      </div>
                    )}
                  </>
                );
              })() : (
              <>
                <div className="alert alert-success fade show mt-2">
                  Refund successful! The transaction has been reversed.
                </div>
                <div className="d-flex justify-content-end mt-4">
                <Button variant="success" onClick={() => {
                  setShowRefundModal(false);
                }}>
                    Done
                  </Button>
                </div>
              </>
            )}
          </Modal.Body>
        </Modal>

          <Modal
            show={showRefundDisputeModal}
            onHide={() => setShowRefundDisputeModal(false)}
            onExited={() => {
              setDisputeSubmitted(false);
              setSelectedTx(null);
            }}
          >
          <Modal.Header closeButton>
            <Modal.Title>Report refunding dispute</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {disputeSubmitted ? (
              <div className="alert alert-success fade show d-flex justify-content-between align-items-center" role="alert">
                <span>Refunding dispute submitted successfully!</span>
                <Button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowRefundDisputeModal(false);
                  }}                  
                >
                  Done
                </Button>
              </div>
            ) : (
              <Form
                onSubmit={handleRefundDisputeSubmit}
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
                noValidate
              >
                <Form.Group className="mb-4">
                  <Form.Label>Transaction ID</Form.Label>
                  <Form.Control
                    type="text"
                    readOnly
                    value={
                      selectedTx?.type === 'freeze_notice'
                        ? `T_${selectedTx?.originalTxId}`
                        : `T_${selectedTx?.id}`
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Comments</Form.Label>
                  <Form.Control as="textarea" id="comments" rows={4} required />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button type="submit" variant="primary">Send</Button>
                </div>
              </Form>
            )}
          </Modal.Body>
      </Modal>


      <Modal
        show={showBillPayProblemModal}
        onHide={() => {
          setShowBillPayProblemModal(false);
          setBillPaySubmitted(false);
        }}
        onExited={() => {
          setBillPaySubmitted(false);
          setSelectedTx(null);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Report bill pay problem</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!billPaySubmitted ? (
            <Form
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                const issueType = e.target.elements.issueType.value;
                const comments = e.target.elements.comments.value;
                if (!issueType) return;
              
                const now = new Date();
                const note = {
                  type: 'bill_pay_problem',
                  date: now.toISOString(),
                  billType: selectedTx?.billType || 'unknown',
                  transactionId: selectedTx?.id,
                  issueType,
                  comments,
                  status: 'OPEN'
                };
              
                // ✅ Ajout à billPayIssues
                const updatedBillPayIssues = [...(selectedUser.billPayIssues || []), note];
              
                // ✅ Ajout à userHistory
                const historyNote = {
                  type: 'bill_pay_problem',
                  ticketId: `TK${Math.random().toString(36).substring(2, 10).toUpperCase()}_SN8`,
                  date: now.toISOString(),
                  raisedBy: authUser?.email || 'support@wave.com',
                  status: 'OPEN',
                  description: `Issue: ${issueType}\nComments: ${comments}`
                };                
                const updatedHistory = [...(selectedUser.userHistory || []), historyNote];
              
                // ✅ Mise à jour utilisateur
                updateUser(selectedUser.id, {
                  billPayIssues: updatedBillPayIssues,
                  userHistory: updatedHistory
                });
              
                setBillPaySubmitted(true);
              }}              
            >
              <Form.Group className="mb-4">
                <Form.Label>Customer mobile</Form.Label>
                <Form.Control type="text" readOnly value={selectedUser?.phone || ''} />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Transaction ID</Form.Label>
                <Form.Control type="text" readOnly value={`T_${selectedTx?.id}`} />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Issue</Form.Label>
                <Form.Select id="issueType" required>
                  <option value=""> Select an issue</option>
                  <option value="OTHER"> Other</option>
                  <option value="AIRTIME_NOT_RECEIVED"> Airtime was not received by the customer</option>
                  <option value="PAYMENT_NOT_TAKEN_INTO_ACCOUNT"> Payment not taken into account</option>
                  <option value="COUPON_OF_CUT_RECEIVED"> Coupon of cut received</option>
                  <option value="TOKEN_NOT_FUNCTIONAL"> Woyofal code received is not functional</option>
                  <option value="TOKEN_NOT_RECEIVED"> Woyofal code not received</option>
                  <option value="REFILL_NOT_RECEIVED"> Refill not received</option>
                </Form.Select>
                <Form.Text className="text-muted">Please select an issue</Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Comments</Form.Label>
                <Form.Control as="textarea" id="comments"/>
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit">Send</Button>
              </div>
            </Form>
          ) : (
            <div className="alert alert-success d-flex justify-content-between align-items-center" role="alert">
              Report submitted successfully!
              <Button variant="primary" onClick={() => setShowBillPayProblemModal(false)}>Done</Button>
            </div>
          )}

          <hr />
          <p>History of bill pay problems</p>
          <table className="table">
            <thead>
              <tr>
                <th>Reported on</th>
                <th>Status</th>
                <th>Bill Type</th>
                <th>Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {(selectedUser.billPayIssues || []).length > 0 ? (
                selectedUser.billPayIssues.map((issue, index) => (
                  <tr key={index}>
                    <td>{new Date(issue.date).toLocaleString('en-GB')}</td>
                    <td>{issue.status}</td>
                    <td>{issue.billType}</td>
                    <td>{`T_${issue.transactionId}`}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" align="center">No reports</td>
                </tr>
              )}
            </tbody>
          </table>
        </Modal.Body>
      </Modal>


      <Modal show={showFreezeModal} onHide={() => setShowFreezeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Freeze Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            const reason = e.target.elements.reason.value;
            processFreeze(reason);
          }}>
            <Form.Group>
              <Form.Label>Reason for freezing</Form.Label>
              <Form.Control as="textarea" rows={3} name="reason" required />
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button type="submit" variant="primary">Freeze</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>


      <Modal
        show={showFreezeWithdrawalModal}
        onHide={() => {
          setShowFreezeWithdrawalModal(false);
          setWithdrawFreezeError(null);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Freeze withdrawal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              const amount = parseInt(e.target.elements.amount.value);
              const note = e.target.elements.note.value;
              const balance = selectedUser?.balance || 0;

              if (isNaN(amount) || amount <= 0) return;

              if (amount > balance) {
                setWithdrawFreezeError("The user's wallet has insufficient funds. Only a part of the withdrawal amount can be frozen.");
                return;
              }

              const now = new Date();
              const iso = now.toISOString();
              const readable = now.toLocaleString('en-GB');
              const authEmail = authUser?.email || 'support@wave.com';

              const frozenTx = {
                id: `FRZ_NOTICE_${selectedTx.id}`,
                type: 'freeze_notice',
                date: iso,
                readableDate: readable,
                originalTxId: selectedTx.id,
                amount: -amount,
                note,
              };

              const updatedTxList = selectedUser.transactions.map(tx =>
                tx.id === selectedTx.id
                  ? { ...tx, frozen: true, frozenBy: authEmail, frozenAt: iso, frozenReason: note }
                  : tx
              );

              updateUser(selectedUser.id, {
                transactions: [frozenTx, ...updatedTxList],
                balance: balance - amount
              });

              setShowFreezeWithdrawalModal(false);
              setWithdrawFreezeError(null);
            }}
          >
            {withdrawFreezeError && (
              <p className="mb-2 text-danger">
                {withdrawFreezeError}
              </p>
            )}

            <Form.Group className="mb-4">
              <Form.Label htmlFor="amount">Amount to freeze</Form.Label>
              <div className="input-group">
                <span className="input-group-text">CFA</span>
                <Form.Control
                  type="text"
                  id="amount"
                  defaultValue={Math.abs(selectedTx?.amount || 0)}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label htmlFor="note">Note</Form.Label>
              <div className="input-group">
                <Form.Control type="text" id="note" />
              </div>
            </Form.Group>

            <div>
              <Button type="submit" className="float-end btn btn-primary">Freeze withdrawal</Button>
              <div className="clearfix"></div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>


      <Modal
        show={showFreezeDepositModal}
        onHide={() => {
          setShowFreezeDepositModal(false);
          setDepositFreezeError(null);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Freeze deposit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              const amount = parseInt(e.target.elements.amount.value);
              const note = e.target.elements.note.value;
              const balance = selectedUser?.balance || 0;

              if (isNaN(amount) || amount <= 0) return;

              if (amount > balance) {
                setDepositFreezeError("The user's wallet has insufficient funds. Only a part of the deposit amount can be frozen.");
                return;
              }

              const now = new Date();
              const iso = now.toISOString();
              const readable = now.toLocaleString('en-GB');
              const authEmail = authUser?.email || 'support@wave.com';

              const frozenTx = {
                id: `FRZ_NOTICE_${selectedTx.id}`,
                type: 'freeze_notice',
                date: iso,
                readableDate: readable,
                originalTxId: selectedTx.id,
                amount: -amount,
                note,
              };

              const updatedTxList = selectedUser.transactions.map(tx =>
                tx.id === selectedTx.id
                  ? { ...tx, frozen: true, frozenBy: authEmail, frozenAt: iso, frozenReason: note }
                  : tx
              );

              updateUser(selectedUser.id, {
                transactions: [frozenTx, ...updatedTxList],
                balance: balance - amount
              });

              setShowFreezeDepositModal(false);
              setDepositFreezeError(null);
            }}
          >
            {depositFreezeError && (
              <p className="mb-2 text-danger">
                {depositFreezeError}
              </p>
            )}

            <Form.Group className="mb-4">
              <Form.Label htmlFor="amount">Amount to freeze</Form.Label>
              <div className="input-group">
                <span className="input-group-text">CFA</span>
                <Form.Control
                  type="text"
                  id="amount"
                  className="form-control"
                  defaultValue={Math.abs(selectedTx?.amount || 0)}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label htmlFor="note">Note</Form.Label>
              <div className="input-group">
                <Form.Control type="text" id="note" className="form-control" />
              </div>
            </Form.Group>

            <div>
              <Button type="submit" className="float-end btn btn-primary">Freeze deposit</Button>
              <div className="clearfix"></div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
  show={showMerchantIssueModal}
  onHide={() => setShowMerchantIssueModal(false)}
  onExited={() => {
    setMerchantIssueSubmitted(false);
    setSelectedTx(null);
  }}
>
  <Modal.Header closeButton>
    <Modal.Title>Report Merchant Issue</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {!merchantIssueSubmitted ? (
      <Form
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          const reporter = e.target.elements.reporter.value;
          const issueType = e.target.elements.issueType.value;
          const comments = e.target.elements.comments.value;
          if (!reporter || !issueType) return;

          const now = new Date();
          const issue = {
            type: 'merchant_issue',
            date: now.toISOString(),
            status: 'OPEN',
            reporter,
            customerMobile: selectedUser?.phone,
            merchantId: selectedTx?.merchant,
            transactionId: selectedTx?.id,
            issueType,
            comments,
            ticketId: `TK${Math.random().toString(36).substring(2, 10).toUpperCase()}_MRCH`
          };

          const updatedHistory = [...(selectedUser.userHistory || []), issue];
          updateUser(selectedUser.id, { userHistory: updatedHistory });
          setMerchantIssueSubmitted(true);
        }}
      >
        <Form.Group className="mb-4">
          <Form.Label>Who is reporting the issue?</Form.Label>
          <Form.Select id="reporter" required>
            <option value=""> Select a reporter</option>
            <option value="Merchant"> Merchant</option>
            <option value="Customer"> Customer</option>
          </Form.Select>
          <Form.Text className="text-muted">Please select who is reporting this issue.</Form.Text>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Customer mobile</Form.Label>
          <Form.Control type="text" disabled value={selectedUser?.phone} />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Merchant ID</Form.Label>
          <Form.Control type="text" disabled value={selectedTx?.merchant || ''} />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Transaction ID</Form.Label>
          <Form.Control type="text" disabled value={`T_${selectedTx?.id}`} />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Issue</Form.Label>
          <Form.Select id="issueType" required>
            <option value=""> Select an issue</option>
            <option value="REFUND_REQUEST"> Refund request</option>
            <option value="ADD_REMOVE_ASSISTANT"> Add/remove assistant</option>
            <option value="KYB_REQUEST"> KYB request</option>
            <option value="NOT_SEEING_PAYMENTS"> Not seeing payments</option>
            <option value="VERIFY_FIELD_EMPLOYEE"> Verify field employee</option>
            <option value="BUSINESS_PROPOSAL_FOLLOW_UP"> Business proposal follow up</option>
            <option value="NEEDS_MERCHANT_QR_CODE"> Needs a merchant QR code</option>
            <option value="NEEDS_HELP_WITH_MERCHANT_SIGNUP"> Needs help with merchant signup</option>
            <option value="NEEDS_MERCHANT_TRAINING"> Needs training</option>
            <option value="RENAME_BUSINESS"> Rename business</option>
            <option value="DEACTIVATION_REQUEST"> Deactivation request</option>
            <option value="OTHER"> Other</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Comments</Form.Label>
          <Form.Control as="textarea" id="comments" />
        </Form.Group>

        <div>
          <Button type="submit" className="float-end btn btn-primary">Send</Button>
          <div className="clearfix"></div>
        </div>
      </Form>
    ) : (
      <div className="alert alert-success fade show d-flex justify-content-between align-items-center" role="alert">
        <span>Merchant issue submitted successfully!</span>
        <Button type="button" className="btn btn-primary" onClick={() => setShowMerchantIssueModal(false)}>
          Done
        </Button>
      </div>
    )}

    <hr />
    <p>History of Merchant Issues</p>
    <div className="table-responsive" style={{ fontSize: "13px" }}>
      <table className="table">
        <thead>
          <tr>
            <th>Reported on</th>
            <th>Status</th>
            <th>Reporter</th>
            <th>Merchant ID</th>
            <th>Transaction ID</th>
            <th>Issue</th>
          </tr>
        </thead>
        <tbody>
          {(selectedUser.userHistory || []).filter(h => h.type === 'merchant_issue').length > 0 ? (
            selectedUser.userHistory
              .filter(h => h.type === 'merchant_issue')
              .map((h, index) => (
                <tr key={index}>
                  <td>{new Date(h.date).toLocaleString('en-GB')}</td>
                  <td>{h.status}</td>
                  <td>{h.reporter}</td>
                  <td>{h.merchantId}</td>
                  <td>{`T_${h.transactionId}`}</td>
                  <td>{h.issueType}</td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="6" align="center">No merchant issues</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </Modal.Body>
</Modal>


    </div>
  );
};

export default TransactionList;
