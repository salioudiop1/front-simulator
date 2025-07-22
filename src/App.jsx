import React, { useEffect, useState } from 'react';
import '../src/styles/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import TopControls from './components/topControllers';
import StatusBar from './components/statusBar';
import CallControls from './components/callControls';
import UserInfo from './components/userInfos';
import ProfileTabs from './components/profileTabs';
import BlockBanners from './components/blockBanners';

import { auth } from './utils/firebase-config';
import { useUserContext } from './utils/UserContext';

import WaveAppModal from './components/WaveAppModal'; // adapte le chemin si besoin

import usePreloadImages from './hooks/usePreloadImages';

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showWaveModal, setShowWaveModal] = useState(false);

  const { selectedUser, users, setSelectedUser } = useUserContext();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setAuthUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  usePreloadImages([
    '/images/vault-reschedule-error.png',
    '/images/qr-background.png',
    '/images/penguin-sad.png'
  ]);

  if (loading) {
    return <div className="text-center mt-5">🔒 Connexion en cours...</div>;
  }

  return (
    <div className="App">
      <TopControls users={users} setSelectedUser={setSelectedUser} />
      <StatusBar />
      <CallControls />

      {selectedUser ? (
        <>
          <BlockBanners blocks={selectedUser.restrictions || []} />
          <UserInfo />
          <ProfileTabs authUser={authUser} />


          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 1060,
          }}>
            <button
              onClick={() => setShowWaveModal(prev => !prev)}
              className={`wave-toggle-button ${showWaveModal ? 'active' : ''}`}
              title={showWaveModal ? 'Fermer' : 'Ouvrir Wave App'}
            >
              📱
            </button>

          </div>
        </>
      ) : (
        <div className="text-center mt-1 text-muted">
          <span style={{ fontSize: '22px', fontWeight: 'bolder' }}>No incoming call found</span> <br /> Start typing in the search bar or select a conversation in Flex.
        </div>
      )}

      <WaveAppModal show={showWaveModal} onHide={() => setShowWaveModal(false)} />

    </div>
  );
}

export default App;
