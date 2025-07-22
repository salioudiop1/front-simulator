import React, { useState } from 'react';
import { Collapse, Form, Button, Dropdown, Modal } from 'react-bootstrap';
import { FaChevronRight } from 'react-icons/fa';
import { useUserContext } from '../../utils/UserContext';

const MerchantPanel = ({ merchant }) => {
  const [openDetails, setOpenDetails] = useState(true);
  const { selectedUser, updateUser } = useUserContext();

  const [showSendLinkModal, setShowSendLinkModal] = useState(false);
  const [sendConfirmed, setSendConfirmed] = useState(false);

  const [showMerchantIssueModal, setShowMerchantIssueModal] = useState(false);
  const [merchantIssueSubmitted, setMerchantIssueSubmitted] = useState(false);

  const handleSendLink = (e) => {
    e.preventDefault();
    console.log(`📲 Sending app link to ${selectedUser?.phone}`);
    setSendConfirmed(true);
  };

  return (
    <div className="p-3 pt-2 pb-0">
      <div className="mb-2 fw-semibold">
        <span>{merchant.id} - {merchant.businessName}</span>
        <span className="badge bg-success ms-2">Active</span>
      </div>

      <div className="mb-1">
        <strong>Location:</strong> {merchant.location}
      </div>
      <div className="mb-1">
        <strong>Category:</strong> {merchant.category}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <div className="mb-1">
            <strong>Balance:</strong> {merchant.balance}F
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowSendLinkModal(true)}
            >
              Send link to Business App
            </button>
            <Dropdown>
              <Dropdown.Toggle variant="outline-dark" size="sm">Escalate</Dropdown.Toggle>
              <Dropdown.Menu>
              <Dropdown.Item onClick={() => setShowMerchantIssueModal(true)}>
                Merchant Issue
              </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className="d-flex align-items-center mt-2 mt-md-0">
          <Form.Control type="text" placeholder="Jump to Date" style={{ maxWidth: '150px' }} readOnly />
          <Button variant="primary">Today</Button>
        </div>
      </div>

      <div className="mb-2">
        <button
          className="d-flex align-items-center w-100 bg-light border-0 px-3 py-2 rounded"
          onClick={() => setOpenDetails(!openDetails)}
        >
          <FaChevronRight
            className="me-2"
            style={{
              transform: openDetails ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
          <span className="fw-medium">Merchant Details</span>
        </button>

        <Collapse in={openDetails}>
          <div className="p-3 bg-white border rounded-bottom">
            <p className="fw-bold text-primary mb-1">{selectedUser?.name}</p>
            <div>ADMIN (Principal)</div>
            <div>{selectedUser?.phone}</div>
          </div>
        </Collapse>
      </div>

      {/* Modal */}
      <Modal
        show={showSendLinkModal}
        onHide={() => setShowSendLinkModal(false)}
        onExited={() => setSendConfirmed(false)} // ✅ S'exécute après l'animation de fermeture
      >
          <Modal.Header closeButton>
            <Modal.Title>
              Send {selectedUser?.name}_job a link to download the Merchant App?
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {!sendConfirmed ? (
              <Form autoComplete="off" onSubmit={handleSendLink}>
                <Form.Group className="mb-4">
                  <Form.Label htmlFor="mobile">Mobile</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      id="mobile"
                      className="form-control"
                      value={selectedUser?.phone}
                      readOnly
                    />
                  </div>
                </Form.Group>
                <div>
                  <Button type="submit" data-testid="submit-button" className="float-right btn btn-primary">
                    Send
                  </Button>
                  <div className="clearfix"></div>
                </div>
              </Form>
            ) : (
              <>
                <div className="alert alert-success fade show d-flex justify-content-between align-items-center" role="alert">
                  <span>Link sent successfully!</span>
                </div>
                <div className="d-flex justify-content-end mt-3">
                <Button variant="primary" onClick={() => setShowSendLinkModal(false)}>
                  Done
                </Button>
                </div>
              </>
            )}
          </Modal.Body>
        </Modal>


        <Modal
          show={showMerchantIssueModal}
          onHide={() => setShowMerchantIssueModal(false)}
          onExited={() => setMerchantIssueSubmitted(false)}
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
                  const note = {
                    type: 'merchant_issue',
                    date: now.toISOString(),
                    status: 'OPEN',
                    reporter,
                    customerMobile: selectedUser?.phone,
                    merchantId: merchant?.id,
                    transactionId: '',
                    issueType,
                    comments,
                    ticketId: `TK${Math.random().toString(36).substring(2, 10).toUpperCase()}_MRCH`
                  };

                  const updatedHistory = [...(selectedUser.userHistory || []), note];
                  updateUser(selectedUser.id, { userHistory: updatedHistory });
                  setMerchantIssueSubmitted(true);
                }}
              >
                <Form.Group className="mb-4">
                  <Form.Label htmlFor="reporter">Who is reporting the issue?</Form.Label>
                  <Form.Select id="reporter" required>
                    <option value=""> Select a reporter</option>
                    <option value="Merchant"> Merchant</option>
                    <option value="Customer"> Customer</option>
                  </Form.Select>
                  <Form.Text className="form-text">Please select who is reporting this issue.</Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label htmlFor="mobile">Customer mobile</Form.Label>
                  <Form.Control type="text" id="mobile" value={selectedUser?.phone || ''} readOnly />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label htmlFor="merchant">Merchant ID</Form.Label>
                  <Form.Control type="text" id="merchant" value={`${merchant?.businessName} (${merchant?.id})`} readOnly />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label htmlFor="transferId">Transaction ID</Form.Label>
                  <Form.Control type="text" id="transferId" />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label htmlFor="issueType">Issue</Form.Label>
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
                  <Form.Text className="form-text">Please select an issue</Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label htmlFor="comments">Comments</Form.Label>
                  <Form.Control as="textarea" id="comments" />
                </Form.Group>

                <div>
                  <Button type="submit" className="float-right btn btn-primary" data-testid="submit-button">
                    Send
                  </Button>
                  <div className="clearfix"></div>
                </div>
              </Form>
            ) : (
              <>
                <div className="alert alert-success fade show" role="alert">
                  Merchant issue submitted successfully!
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <Button variant="primary" onClick={() => setShowMerchantIssueModal(false)}>
                    Done
                  </Button>
                </div>
              </>
            )}

            <hr />
            <p>History of Merchant Issues</p>
            <div className="table-responsive" style={{ maxHeight: 200 }}>
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Reported on</th>
                  <th>Status</th>
                  <th>Reporter</th>
                  <th>Merchant ID</th>
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
                        <td>{h.issueType}</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="5" align="center">No merchant issues</td>
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

export default MerchantPanel;
