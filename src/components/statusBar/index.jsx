import React, { useState } from 'react';
import { Dropdown, Button, Modal, Form } from 'react-bootstrap';
import { useUserContext } from '../../utils/UserContext';

const StatusBar = () => {
  const { selectedUser, updateUser } = useUserContext();
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');

  const [status, setStatus] = useState('Training');
  const [callChannel, setCallChannel] = useState('ZOOM');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const noteContent = `${reasonLabel(reason)}${comments ? ` ${comments}` : ''}`;
    const note = {
      author: 'saliou.diop@wave.com', // ou authUser.email si disponible
      content: noteContent,
      date: new Date().toISOString(),
    };

    const newHistory = selectedUser.userHistory
      ? [...selectedUser.userHistory, note]
      : [note];

    updateUser(selectedUser.id, { userHistory: newHistory });
    setSubmitted(true);
  };

  const reasonLabel = (code) => {
    const labels = {
      balance: 'Balance check.',
      confirm_transfer: 'Confirm a transaction.',
      list_of_transactions: 'List of transactions.',
      dormancy: 'Dormancy question.',
      ussd_assistance: 'USSD assistance.',
      kyc_limits: 'KYC Limits (Uncapping).',
      asked_vault_info: 'Vault.',
      asked_about_virtual_visa: 'Virtual Visa.',
      pin: 'Recover pin, no internet.',
      asked_wave_info: 'About Wave.',
      asked_partner_info: 'About Partners.',
      find_agents: 'Find nearby agents.',
      partner_issue: 'Partner Issue (Woyofal, 1xBet, Sendwave).',
      bug: 'Bug: Customer app.',
      scam_follow_up: 'Scam Case follow up.',
      callback_reported_issue: 'Callback about a prior issue.',
      call_dropped: 'Call dropped.',
      silent_call: 'Silent call - no sound / bad sound.',
      silent_call_unresponsive: 'Silent call - client unresponsive.',
      robotic_call: 'Robotic call.',
      agent_charging_fee: 'Agent charging fee.',
      agent_rejected: 'Agent rejected.',
      refund_unavailable: 'Reversal unavailable.',
      failed_verification: 'Customer failed verification questions.',
      will_call_back: 'Customer will contact again with right number.',
      caller_not_owner: 'Caller is not the owner.',
      language_barrier: 'Language barrier.',
      thank_you: 'Gratitudes.',
      joker: 'Spam/Joke caller / Mistake.',
      info_not_available: 'Information not available to proceed.',
      other: 'Other.',
    };
    return labels[code] || '';
  };
  

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Offline':
        return 'danger';
      case 'Break':
        return 'danger';
      case 'Lunch':
        return 'warning'; // jaune/orange
      case 'Training':
        return 'success'; // vert
      default:
        return 'dark';
    }
  };  

  return (
    <>
      <div className="d-flex justify-between align-items-center px-2">
        <div className="d-flex ms-auto flex-wrap align-items-center justify-end mb-1">
        <Dropdown className="me-2">
          <Dropdown.Toggle variant={getStatusVariant(status)}>{status}</Dropdown.Toggle>
          <Dropdown.Menu>
            {[
              'Break',
              'Lunch',
              'Offline',
              'Training'
            ].map((item) => (
              <Dropdown.Item
                key={item}
                active={status === item}
                onClick={() => setStatus(item)}
              >
                {item}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown className="me-2">
          <Dropdown.Toggle variant="secondary" disabled>
            {callChannel}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setCallChannel('ZOOM')}>ZOOM</Dropdown.Item>
            <Dropdown.Item onClick={() => setCallChannel('GSM')}>GSM</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

          <div className="d-inline-flex me-2">
            <span className="border border-2 rounded-start p-1 bg-light">
              👥 <span className="text-end d-inline-block w-6">0</span>
            </span>
            <span className="border border-2 rounded-end p-1 w-14">00:00</span>
          </div>

          <div className="d-inline-flex me-2">
            <span className="border border-2 rounded-start p-1 bg-light text-primary">✔️ 0</span>
            <span className="border border-2 rounded-end p-1 text-danger border-danger">❌ 0</span>
          </div>

          <Dropdown className="me-2">
            <Dropdown.Toggle variant="secondary" disabled>Report call issue</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>Bad sound</Dropdown.Item>
              <Dropdown.Item>Silent call</Dropdown.Item>
              <Dropdown.Item>Call dropped</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={() => {
              setReason('');
              setComments('');
              setSubmitted(false);
              setShowModal(true);
            }}
          >
            Report No Action Call
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>No action call survey</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitted ? (
            <>
              <p className="alert alert-success">Survey submitted successfully!</p>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Done
              </Button>
            </>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label>Caller mobile</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedUser ? `${selectedUser.phone} • ${selectedUser.name}` : ''}
                  disabled
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Reason</Form.Label>
                <Form.Select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  <option value="" disabled>Select an option</option>
                  <optgroup label="Asked for account info">
                    <option value="balance">Balance check</option>
                    <option value="confirm_transfer">Confirm a transaction</option>
                    <option value="list_of_transactions">List of transactions</option>
                    <option value="dormancy">Dormancy question</option>
                    <option value="ussd_assistance">USSD assistance</option>
                    <option value="kyc_limits">KYC Limits (Uncapping)</option>
                    <option value="asked_vault_info">Vault</option>
                    <option value="asked_about_virtual_visa">Virtual Visa</option>
                    <option value="pin">Recover pin, no internet</option>
                  </optgroup>
                  <optgroup label="Asked for information">
                    <option value="asked_wave_info">About Wave</option>
                    <option value="asked_partner_info">About Partners</option>
                    <option value="find_agents">Find nearby agents</option>
                  </optgroup>
                  <optgroup label="Bugs/issues">
                    <option value="partner_issue">Partner Issue (Woyofal, 1xBet, Sendwave)</option>
                    <option value="bug">Bug: Customer app</option>
                    <option value="scam_follow_up">Scam Case follow up</option>
                    <option value="callback_reported_issue">Callback about a prior issue</option>
                  </optgroup>
                  <optgroup label="Call failed or poor call quality">
                    <option value="call_dropped">Call dropped</option>
                    <option value="silent_call">Silent call - no sound / bad sound</option>
                    <option value="silent_call_unresponsive">Silent call - client unresponsive</option>
                    <option value="robotic_call">Robotic call</option>
                  </optgroup>
                  <optgroup label="Forgot QR Card">
                    <option value="agent_charging_fee">Agent charging fee</option>
                    <option value="agent_rejected">Agent rejected</option>
                  </optgroup>
                  <optgroup label="Refund">
                    <option value="refund_unavailable">Reversal unavailable</option>
                  </optgroup>
                  <optgroup label="User doesn't match account">
                    <option value="failed_verification">Customer failed verification questions</option>
                    <option value="will_call_back">Customer will contact again with right number</option>
                    <option value="caller_not_owner">Caller is not the owner</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="language_barrier">Language barrier</option>
                    <option value="thank_you">Gratitudes</option>
                    <option value="joker">Spam/Joke caller / Mistake</option>
                    <option value="info_not_available">Information not available to proceed</option>
                    <option value="other">Other</option>
                  </optgroup>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Comments</Form.Label>
                <Form.Control
                  type="text"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Optional"
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button type="submit" variant="primary" disabled={!reason}>
                  Submit
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default StatusBar;
