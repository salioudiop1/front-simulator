import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import PersonalPanel from '../personalPanel';
import UserHistorySection from '../userHistory';
import TransactionList from '../transactionList';
import MerchantPanel from '../merchantPanel';
import AgentPanel from '../agentPanel';
import { useUserContext } from '../../utils/UserContext';

const ProfileTabs = ({ authUser }) => {
  const { selectedUser, targetTab, setTargetTab } = useUserContext();
  const [key, setKey] = useState('personal');

  // Appliquer la redirection si un onglet est ciblé
  useEffect(() => {
    if (!selectedUser || !targetTab) return;

    const tabExists =
      (targetTab === 'agent' && selectedUser.agent) ||
      (targetTab === 'merchant' && selectedUser.merchant) ||
      targetTab === 'personal' ||
      targetTab === 'history';

    if (tabExists) setKey(targetTab);
  }, [targetTab, selectedUser]);

  // Réinitialiser targetTab après redirection
  useEffect(() => {
    if (targetTab && key === targetTab) {
      setTargetTab(null);
    }
  }, [key, targetTab, setTargetTab]);

  // Sécurité : revenir à personal si l'onglet sélectionné n'est plus valide
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
          <UserHistorySection authUser={authUser}/>
        </Tab>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
