import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import PersonalPanel from '../personalPanel';
import UserHistorySection from '../userHistory';
import TransactionList from '../transactionList';
import MerchantPanel from '../merchantPanel';
import AgentPanel from '../agentPanel';
import { useUserContext } from '../../utils/UserContext';
import { parse, isToday, format, isValid } from 'date-fns';

const ProfileTabs = ({ authUser }) => {
  const { selectedUser, targetTab, setTargetTab } = useUserContext();
  const [key, setKey] = useState('personal');

  useEffect(() => {
    if (!selectedUser || !targetTab) return;
    const tabExists =
      (targetTab === 'agent' && selectedUser.agent) ||
      (targetTab === 'merchant' && selectedUser.merchant) ||
      targetTab === 'personal' ||
      targetTab === 'history' ||
      targetTab === 'errorLogs';
    if (tabExists) setKey(targetTab);
  }, [targetTab, selectedUser]);

  useEffect(() => {
    if (targetTab && key === targetTab) {
      setTargetTab(null);
    }
  }, [key, targetTab, setTargetTab]);

  useEffect(() => {
    if (
      selectedUser &&
      ((key === 'agent' && !selectedUser.agent) ||
        (key === 'merchant' && !selectedUser.merchant))
    ) {
      setKey('personal');
    }
  }, [key, selectedUser]);

  if (!selectedUser) return null;

  return (
    <div className="profile-tabs mt-3">
      <Tabs id="profile-tabs" activeKey={key} onSelect={(k) => setKey(k)}>
        <Tab eventKey="personal" title="Personal">
          <PersonalPanel user={selectedUser} authUser={authUser} />
          <TransactionList transactions={selectedUser.transactions || []} authUser={authUser} />
        </Tab>

        {selectedUser.agent && (
          <Tab eventKey="agent" title="Agent">
            <AgentPanel agent={selectedUser.agent} />
            <TransactionList transactions={selectedUser.agent.transactions || []} authUser={authUser} />
          </Tab>
        )}

        {selectedUser.merchant && (
          <Tab eventKey="merchant" title="Merchant">
            <MerchantPanel merchant={selectedUser.merchant} />
            <TransactionList transactions={selectedUser.merchant.transactions || []} authUser={authUser} />
          </Tab>
        )}

        <Tab
          eventKey="history"
          title={
            <>
              History{' '}
              {selectedUser?.userHistory?.length > 0 && (
                <span className="badge rounded-pill text-white bg-warning">
                  {selectedUser.userHistory.length}
                </span>
              )}
            </>
          }
        >
          <UserHistorySection authUser={authUser} />
        </Tab>

        <Tab
          eventKey="errorLogs"
          title={
            <>
              Error Logs{' '}
              {selectedUser?.errorLogs?.length > 0 && (
                <span className="badge rounded-pill text-white bg-danger">
                  {selectedUser.errorLogs.length}
                </span>
              )}
            </>
          }
        >
          <div className="p-3">
            {selectedUser?.errorLogs?.length > 0 ? (
              <ul className="list-unstyled">
                {[...selectedUser.errorLogs]
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((log, index) => {
                    const parsedDate = parse(log.date, 'dd/MM/yyyy, HH:mm', new Date());
                    const isValidDate = isValid(parsedDate);
                    const formattedDate = isValidDate
                      ? isToday(parsedDate)
                        ? `Today, ${format(parsedDate, 'HH:mm')}`
                        : format(parsedDate, 'dd/MM/yyyy, HH:mm')
                      : 'Date invalide';

                    return (
                      <li key={index} className="mb-3 border-bottom pb-2">
                        <div>
                          <span
                            className="badge me-2"
                            style={{
                              backgroundColor: 'gray',
                              color: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            {log.app}
                          </span>
                          <strong>{formattedDate}</strong>
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.9em' }}>
                          {log.error}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <div className="text-center text-muted">No error logs found.</div>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
