import React, { createContext, useContext, useState, useEffect } from 'react';
import { fakeUsers } from '../data/fakeAccounts';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState(fakeUsers);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [highlightedTransactionId, setHighlightedTransactionId] = useState(null);
  const [targetTab, setTargetTab] = useState(null);

  const [userHistory, setUserHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const selectedUser = users.find(u => u.id === selectedUserId) || null;

  const setSelectedUser = (userOrPhone, highlightTxId = null, tab = 'personal') => {
    if (!userOrPhone) {
      setSelectedUserId(null);
      setHighlightedTransactionId(null);
      setTargetTab(null);
      setUserHistory([]);
      setHistoryIndex(-1);
      return;
    }

    const foundUser = typeof userOrPhone === 'object'
      ? userOrPhone
      : users.find(u => u.phone === userOrPhone);

    if (!foundUser) return;

    setSelectedUserId(foundUser.id);
    setTargetTab(tab);

    setUserHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), foundUser.id];
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });

    if (highlightTxId) {
      setHighlightedTransactionId(null);
      setTimeout(() => setHighlightedTransactionId(highlightTxId), 0);
    }
  };

  const setSelectedUserTab = (tab) => {
    setTargetTab(tab);
  };

  const updateUser = (id, updates) => {
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user =>
        user.id === id ? { ...user, ...updates } : user
      );

      // Ne pas reset selectedUserId à null → garde l'état actif
      if (id === selectedUserId) {
        const currentTab = targetTab;
        if (currentTab) setTargetTab(currentTab); // on garde l'onglet actif
      }

      return updatedUsers;
    });
  };

  const goToPreviousUser = () => {
    if (historyIndex > 0) {
      const prevId = userHistory[historyIndex - 1];
      setSelectedUserId(prevId);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const goToNextUser = () => {
    if (historyIndex < userHistory.length - 1) {
      const nextId = userHistory[historyIndex + 1];
      setSelectedUserId(nextId);
      setHistoryIndex(historyIndex + 1);
    }
  };

  useEffect(() => {
    if (selectedUserId && !users.find(u => u.id === selectedUserId)) {
      setSelectedUserId(null);
    }
  }, [users, selectedUserId]);

  return (
    <UserContext.Provider
      value={{
        users,
        selectedUser,
        setSelectedUser,
        updateUser,
        highlightedTransactionId,
        setHighlightedTransactionId,
        targetTab,
        setTargetTab,
        setSelectedUserTab,
        goToPreviousUser,
        goToNextUser,
        userHistory,
        historyIndex
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
