import React, { useState } from 'react';
import { Button, Modal, Form, Dropdown } from 'react-bootstrap';
import { useUserContext } from '../../utils/UserContext';

const UserHistorySection = ({ authUser }) => {
  const { selectedUser, updateUser, setSelectedUserTab, users } = useUserContext();

  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const formatIssueLabel = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    const newNote = {
      author: authUser.email,
      content: note,
      date: new Date().toISOString()
    };

    updateUser(selectedUser.id, {
      userHistory: [...(selectedUser.userHistory || []), newNote]
    });

    setSubmitted(true);
    setSelectedUserTab('history');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNote('');
    setSubmitted(false);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (!noteToDelete) return;

    const newHistory = selectedUser.userHistory.filter(n => n !== noteToDelete);
    updateUser(selectedUser.id, { userHistory: newHistory });
    setShowDeleteModal(false);
    setNoteToDelete(null);
    setSelectedUserTab('history');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="history-tab p-2" style={{margin: '0px 5px'}}>
      <div className="bg-gray-50 border-b border-gray-200 py-2 pr-12 pl-2">
        <div className="btn-toolbar" role="toolbar">
          <div role="group" className="btn-group">
            <Button variant="outline-dark" onClick={() => setShowModal(true)}>Add note</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {[...(selectedUser.userHistory || [])]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((note, idx) => (
            <div key={idx} className="border-b border-gray-200 pb-2 relative">
              {note.type === 'refunding_dispute' ? (
                <div className="ticket-item">
                  <div className="ticket-header">
                    <span style={{ fontSize: '1.25rem', color: '#772F16' }}>
                      <i className="fa-solid fa-folder"></i>
                    </span>
                    Refunding Dispute #{note.ticketId}
                    <span className="ticket-badge">OPEN</span>
                  </div>
                  <div className="ticket-meta">
                    Raised {formatDate(note.date)} by {note.raisedBy}
                  </div>
                  <div className="ticket-description">
                    <div className="label"><strong>Description :</strong></div>
                    <div style={{ marginLeft: "15px" }}>{note.description}</div>
                  </div>
                </div>
              ) : note.type === 'bill_pay_problem' ? (
                <div className="ticket-item">
                  <div className="ticket-header">
                    <span style={{ fontSize: '1.25rem', color: '#772F16' }}>
                      <i className="fa-solid fa-folder"></i>
                    </span>{' '}
                    Bill Pay Problem #{note.ticketId}
                    <span className="ticket-badge">{note.status}</span>
                  </div>
                  <div className="ticket-meta">
                    Raised {formatDate(note.date)} by {note.raisedBy}
                  </div>
                  <div className="ticket-description">
                    <div className="label"><strong>Description :</strong></div>
                    <div style={{ marginLeft: "15px", whiteSpace: "pre-line" }}>{formatIssueLabel(note.description)}</div>
                  </div>
                </div>
              ) : note.type === 'merchant_issue' ? (
                <div className="ticket-item">
                  <div className="ticket-header">
                    <span style={{ fontSize: '1.25rem', color: '#772F16' }}>
                      <i className="fa-solid fa-folder"></i>
                    </span>{' '}
                    Merchant Issue #{note.ticketId}
                    <span className="ticket-badge">{note.status}</span>
                  </div>
                  <div className="ticket-meta">
                    Reported {formatDate(note.date)} by {note.reporter}
                  </div>
                  <div className="ticket-description">
                    <div><strong>Issue :</strong> {formatIssueLabel(note.issueType)}</div>
                    <div><strong>Merchant ID :</strong> {note.merchantId}</div>
                    {note.transactionId?.trim() && note.transactionId !== '' && note.transactionId !== '_' && note.transactionId !== 'T_' && (
                      <div><strong>Transaction ID :</strong> T_{note.transactionId}</div>
                    )}

                    {note.comments?.trim() && (
                      <div style={{ marginTop: "5px" }}>
                        <div className="label"><strong>Comments :</strong></div>
                        <div style={{ marginLeft: "15px", whiteSpace: "pre-line" }}>{note.comments}</div>
                      </div>
                    )}
                  </div>
                </div>
                ) : note.type === 'agent_request' ? (
                  <div className="ticket-item">
                    <div className="ticket-header">
                      <span style={{ fontSize: '1.25rem', color: '#772F16' }}>
                        <i className="fa-solid fa-folder"></i>
                      </span>{' '}
                      Agent Request #{note.ticketId}
                      <span className="ticket-badge">{note.status}</span>
                    </div>
                    <div className="ticket-meta">
                      Reported {formatDate(note.date)} from agent {note.agentName}
                    </div>
                    <div className="ticket-description mt-2">
                      <div><strong>Issue type :</strong> {formatIssueLabel(note.issueType)}</div>
                      <div><strong>Agent ID :</strong> {note.agentId}</div>
                      <div><strong>Agent name :</strong> {note.agentName}</div>
                      {note.description?.trim() && (
                        <div style={{ marginTop: "5px" }}>
                          <div className="label"><strong>Description :</strong></div>
                          <div style={{ marginLeft: "15px", whiteSpace: "pre-line" }}>{note.description}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : note.type === 'user_complaint' ? (
                  <div className="ticket-item">
                    <div className="ticket-header">
                      <span style={{ fontSize: '1.25rem', color: '#772F16' }}>
                        <i className="fa-solid fa-user-xmark"></i>
                      </span>{' '}
                      User Complaint #{note.ticketId}
                      <span className="ticket-badge">{note.status}</span>
                    </div>
                    <div className="ticket-meta">
                      Reported {formatDate(note.date)} by {note.callerMobile}
                    </div>
                    <div className="ticket-description">
                      <div><strong>Issue :</strong> {formatIssueLabel(note.issueType)}</div>
                      {note.description?.trim() && (
                        <div style={{ marginTop: "5px" }}>
                          <div className="label"><strong>Description :</strong></div>
                          <div style={{ marginLeft: "15px", whiteSpace: "pre-line" }}>{note.description}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  ) : note.type === 'commission_explanation_request' ? (
                    <div className="ticket-item">
                      <div className="ticket-header">
                        <span style={{ fontSize: '1.25rem', color: '#772F16' }}>
                          <i className="fa-solid fa-folder"></i>
                        </span>{' '}
                        Commission Cut Explanation #{note.ticketId}
                        <span className="ticket-badge">{note.status}</span>
                      </div>
                      <div className="ticket-meta">
                        Requested {formatDate(note.date)} by {authUser?.email}
                      </div>
                      <div className="ticket-description">
                        <div><strong>Agent :</strong> {note.agentName} (ID : {note.agentId})</div>
                        <div style={{ marginTop: "5px" }}>
                          <div className="label"><strong>Reason :</strong></div>
                          <div style={{ marginLeft: "15px", whiteSpace: "pre-line" }}>{note.reason}</div>
                        </div>
                      </div>
                    </div> 
                    ) : (
                <div style={{margin: '0px 5px'}}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="notes-list-item-user">{note.author}</span>
                    <div role="group" className="btn-group btn-group-sm">
                      <Dropdown>
                        <Dropdown.Toggle size="sm" variant="light" className="border border-dark rounded px-2 py-0 ms-2" />
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => { setNoteToDelete(note); setShowDeleteModal(true); }}>
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                  <div className="ms-2">
                    <span className="whitespace-pre-line">{note.content}</span>
                  </div>
                  <div>
                    <span className="italic text-muted">{formatDate(note.date)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Add Note Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add support note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit} autoComplete="off">
            <Form.Group className="mb-4">
              <Form.Label htmlFor="content">Content</Form.Label>
              <Form.Control
                type="text"
                id="content"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                isInvalid={!note.trim() && submitted}
                disabled={submitted}
              />
              {!note.trim() && submitted && (
                <Form.Text className="text-muted">Content cannot be empty</Form.Text>
              )}
            </Form.Group>

            {submitted ? (
              <div className="alert alert-success fade show d-flex justify-content-between align-items-center" role="alert">
                <span>Note added</span>
                <Button
                  type="button"
                  className="float-right btn btn-primary"
                  data-testid="form-done-button"
                  onClick={handleCloseModal}
                >
                  Done
                </Button>
              </div>
            ) : (
              <Button
                type="submit"
                variant="primary"
                className="float-right"
                disabled={!note.trim()}
                data-testid="submit-button"
              >
                Add
              </Button>
            )}
            <div className="clearfix"></div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Note Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleDelete} autoComplete="off">
            <p>Delete the following note:</p>
            <pre className="whitespace-normal mt-2">{noteToDelete?.content}</pre>
            <Button
              type="submit"
              data-testid="submit-button"
              className="float-right btn btn-primary"
            >
              Delete
            </Button>
            <div className="clearfix"></div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserHistorySection;
