import React, { useState } from 'react';
import { Collapse, Form, Button, Dropdown, Modal } from 'react-bootstrap';
import { FaChevronRight } from 'react-icons/fa';
import { useUserContext } from '../../utils/UserContext';

const AgentPanel = ({ agent }) => {
  const [showUsers, setShowUsers] = useState(false);
  const { selectedUser, updateUser } = useUserContext();

  const [showAgentRequestModal, setShowAgentRequestModal] = useState(false);
  const [agentRequestSubmitted, setAgentRequestSubmitted] = useState(false);

  const [showUserComplaintModal, setShowUserComplaintModal] = useState(false);
  const [userComplaintSubmitted, setUserComplaintSubmitted] = useState(false);

  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionSubmitted, setCommissionSubmitted] = useState(false);

  const [showSuspendRebalanceModal, setShowSuspendRebalanceModal] = useState(false);
  const [suspendSubmitted, setSuspendSubmitted] = useState(false);

  const [showAgentAppModal, setShowAgentAppModal] = useState(false);
  const [appLinkSent, setAppLinkSent] = useState(false);

  return (
    <div className="p-3 pb-0">
      <div className="fw-semibold mb-2">
        <span>{agent.id} - {agent.shopName} - {agent.address}</span>
        <span className="badge bg-success ms-2">ACTIVE</span>
      </div>

      <div className="table-responsive mb-2">
        <table className="table table-borderless table-sm mb-0">
          <tbody>
            <tr>
              <td><strong>Balance</strong></td>
              <td>{agent.balance}F</td>
              <td><strong>Commission</strong></td>
              <td>{agent.commission}F</td>
            </tr>
            <tr>
              <td><strong>Agent-type</strong></td>
              <td>{agent.type}</td>
              <td><strong>Minimum Balance Limit</strong></td>
              <td>0F</td>
            </tr>
            <tr>
              <td><strong>Rebalance Limit</strong></td>
              <td>0F (overdraft)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div className="btn-group">
        <button className="btn btn-outline-secondary btn-sm" disabled>Withdraw</button>
        <button className="btn btn-outline-secondary btn-sm" disabled>Deposit</button>
        <button className="btn btn-outline-secondary btn-sm" disabled>Deposit and Send</button>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setShowAgentRequestModal(true)}
        >
          Agent Request
        </button>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size="sm">Escalate</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setShowUserComplaintModal(true)}>User Complaint</Dropdown.Item>
              <Dropdown.Item onClick={() => setShowCommissionModal(true)}>
                Request Risk to explain commission cuts
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setShowSuspendRebalanceModal(true)}>
                Request to suspend rebalance limits
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size="sm">More</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item disabled>Rebalance withdraw</Dropdown.Item>
              <Dropdown.Item disabled>Rebalance deposit</Dropdown.Item>
              <Dropdown.Item onClick={() => setShowAgentAppModal(true)}>
                Send link to Agent App
              </Dropdown.Item>
              <Dropdown.Item disabled>Show Agent's Network</Dropdown.Item>
              <Dropdown.Item disabled>Add Agent to Agent Gaming Whitelist</Dropdown.Item>
              <Dropdown.Item disabled>Add Agent to Agent Gaming Blacklist</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-danger btn-sm" disabled>Show cancelled transactions</button>
          <Form.Control type="text" placeholder="Jump to Date" style={{ maxWidth: '150px' }} readOnly />
          <Button variant="primary">Today</Button>
        </div>
      </div>

      {/* Users */}
      <div className="border-top pt-2 mb-3">
        <button
          className="d-flex align-items-center w-100 bg-light border-0 px-3 py-2 rounded"
          onClick={() => setShowUsers(!showUsers)}
        >
          <FaChevronRight
            className="me-2"
            style={{
              transform: showUsers ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
          <span className="fw-medium">Agent Users</span>
        </button>

        <Collapse in={showUsers}>
          <div className="p-3 bg-white border rounded-bottom">
            {agent.users.map((u, i) => (
              <div key={i} className="mb-2">
                <span className="fw-bold">{u.name}</span>
                {u.role && <span className="badge bg-primary ms-2">{u.role}</span>}
                <span className="ms-3 text-muted">{u.phone}</span>
              </div>
            ))}
            {selectedUser && (
              <div className="mt-3">
                <hr />
                <div className="fw-bold text-primary">Primary Admin</div>
                <div>{selectedUser.name}</div>
                <div>{selectedUser.phone}</div>
              </div>
            )}
          </div>
        </Collapse>
      </div>


      <Modal
        show={showAgentRequestModal}
        onHide={() => setShowAgentRequestModal(false)}
        onExited={() => setAgentRequestSubmitted(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Report a request from agent {agent?.shopName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!agentRequestSubmitted ? (
            <Form
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                const issueType = e.target.elements.issueType.value;
                const description = e.target.elements.description.value;

                if (!issueType) return;

                const now = new Date();
                const note = {
                  type: 'agent_request',
                  date: now.toISOString(),
                  agentId: agent?.id,
                  agentName: agent?.shopName,
                  issueType,
                  description,
                  status: 'OPEN',
                  ticketId: `TK${Math.random().toString(36).substring(2, 10).toUpperCase()}_AGREQ`
                };

                const updatedHistory = [...(selectedUser.userHistory || []), note];
                updateUser(selectedUser.id, { userHistory: updatedHistory });
                setAgentRequestSubmitted(true);
              }}
            >
              <Form.Group className="mb-4">
                <Form.Label htmlFor="issueType">Issue type</Form.Label>
                <Form.Select id="issueType" required>
                  <option value=""> Select an issue type</option>
                  <option value="NEEDS_CASH"> Needs cash</option>
                  <option value="NEEDS_CASH_PICKUP"> Needs cash to be picked up</option>
                  <option value="NEEDS_BANK_REBALANCE"> Sent bank transfer and needs rebalancing</option>
                  <option value="NEEDS_BANNER"> Needs new banner</option>
                  <option value="NEEDS_FLYERS"> Needs flyers</option>
                  <option value="NEEDS_QR_CARDS"> Needs QR cards</option>
                  <option value="AGENT_NEEDS_TRAINING"> Needs training</option>
                  <option value="NEEDS_SHARED_AGENT"> Needs shared agent created</option>
                  <option value="OTHER_AGENT_REQUEST"> Other issue (include notes)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label htmlFor="description">Description</Form.Label>
                <Form.Control as="textarea" id="description" />
              </Form.Group>

              <div>
                <Button type="submit" className="float-right btn btn-primary" data-testid="submit-button">
                  Report
                </Button>
                <div className="clearfix"></div>
              </div>
            </Form>
          ) : (
            <>
              <div className="alert alert-success fade show" role="alert">
                Agent request submitted successfully!
              </div>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="primary" onClick={() => setShowAgentRequestModal(false)}>
                  Done
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>


      <Modal
        show={showUserComplaintModal}
        onHide={() => setShowUserComplaintModal(false)}
        onExited={() => setUserComplaintSubmitted(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Report a user complaint on agent {agent?.shopName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!userComplaintSubmitted ? (
            <Form
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                const callerMobile = e.target.elements.callerMobile.value;
                const issueType = e.target.elements.issueType.value;
                const description = e.target.elements.description.value;

                if (!callerMobile || !issueType) return;

                const now = new Date();
                const note = {
                  type: 'user_complaint',
                  date: now.toISOString(),
                  agentId: agent?.id,
                  agentName: agent?.shopName,
                  callerMobile,
                  issueType,
                  description,
                  status: 'OPEN',
                  ticketId: `TK${Math.random().toString(36).substring(2, 10).toUpperCase()}_UCOMP`
                };

                const updatedHistory = [...(selectedUser.userHistory || []), note];
                updateUser(selectedUser.id, { userHistory: updatedHistory });
                setUserComplaintSubmitted(true);
              }}
            >
              <Form.Group className="mb-4">
                <Form.Label htmlFor="callerMobile">Caller mobile</Form.Label>
                <Form.Control type="text" id="callerMobile" required />
                <Form.Text>Please select a mobile</Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label htmlFor="issueType">Issue type</Form.Label>
                <Form.Select id="issueType" required>
                  <option value=""> Select an issue type</option>
                  <option value="CHARGING_EXTRA_FEES_FOR_SIGNUP"> Charging extra fees for signup</option>
                  <option value="CHARGING_EXTRA_FEES_FOR_TRANSACTIONS"> Charging extra fees for transactions</option>
                  <option value="REFUSING_TO_DO_SMALL_TRANSACTIONS"> Refusing to do small transactions</option>
                  <option value="CLOSED_PERMANENTLY"> Closed</option>
                  <option value="OTHER_USER_COMPLAINT"> Other problem (include notes)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label htmlFor="description">Description</Form.Label>
                <Form.Control as="textarea" id="description" placeholder="Please select an issue to report" />
              </Form.Group>

              <div>
                <Button type="submit" className="float-right btn btn-primary" data-testid="submit-button">
                  Report
                </Button>
                <div className="clearfix"></div>
              </div>
            </Form>
          ) : (
            <>
              <div className="alert alert-success fade show" role="alert">
                User complaint submitted successfully!
              </div>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="primary" onClick={() => setShowUserComplaintModal(false)}>
                  Done
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>


      <Modal
        show={showCommissionModal}
        onHide={() => setShowCommissionModal(false)}
        onExited={() => setCommissionSubmitted(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Request Risk to call agent to explain commission cuts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!commissionSubmitted ? (
            <Form
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                const reason = e.target.elements.reason.value;
                if (!reason.trim()) return;

                const now = new Date();
                const note = {
                  type: 'commission_explanation_request',
                  date: now.toISOString(),
                  agentId: agent?.id,
                  agentName: agent?.shopName,
                  reason,
                  status: 'OPEN',
                  ticketId: `TK${Math.random().toString(36).substring(2, 10).toUpperCase()}_COMM`
                };

                const updatedHistory = [...(selectedUser.userHistory || []), note];
                updateUser(selectedUser.id, { userHistory: updatedHistory });
                setCommissionSubmitted(true);
              }}
            >
              <p>
                Upon the approval of this request, the agent will be called to explain the reason for recent commission cuts.
              </p>
              <Form.Group className="mb-4">
                <Form.Label htmlFor="reason">Reason</Form.Label>
                <Form.Control type="text" id="reason" required />
                <Form.Text className="text-muted">
                  Please specify why this agent is requesting to discuss their commission cuts. Include as much detail as possible.
                </Form.Text>
              </Form.Group>
              <div>
                <Button type="submit" className="float-right btn btn-primary" data-testid="submit-button">
                  Request Risk to call agent to explain commission cuts
                </Button>
                <div className="clearfix"></div>
              </div>
            </Form>
          ) : (
            <>
              <div className="alert alert-success fade show" role="alert">
                Request submitted successfully!
              </div>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="primary" onClick={() => setShowCommissionModal(false)}>
                  Done
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>


      <Modal
        show={showSuspendRebalanceModal}
        onHide={() => setShowSuspendRebalanceModal(false)}
        onExited={() => setSuspendSubmitted(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Post to Slack</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!suspendSubmitted ? (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                setSuspendSubmitted(true);
              }}
            >
              <p>This will post a request to suspend rebalance limits to the agent management team on Slack.</p>
              <div>
                <Button type="submit" className="float-right btn btn-primary" data-testid="submit-button">
                  Post to Slack
                </Button>
                <div className="clearfix"></div>
              </div>
            </Form>
          ) : (
            <>
              <div className="alert alert-success fade show" role="alert">
                Request posted successfully to Slack.
              </div>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="primary" onClick={() => setShowSuspendRebalanceModal(false)}>
                  Done
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>


      <Modal
        show={showAgentAppModal}
        onHide={() => {
          setShowAgentAppModal(false);
          setAppLinkSent(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Send {agent?.shopName} a link to download the Agent App?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!appLinkSent ? (
            <Form
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                setAppLinkSent(true);
              }}
            >
              <Form.Group className="mb-4">
                <Form.Label htmlFor="mobile">Mobile</Form.Label>
                <Form.Control id="mobile" type="text" value={selectedUser?.phone || ''} readOnly />
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
              <div className="alert alert-success fade show" role="alert">
                Link sent successfully!
              </div>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="primary" onClick={() => setShowAgentAppModal(false)}>
                  Done
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default AgentPanel;
