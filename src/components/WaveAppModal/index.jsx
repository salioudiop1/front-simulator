import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { useUserContext } from '../../utils/UserContext';
import TransferModalContent from '../transfertModalContent';
import TransferAmountScreen from '../transferAmountScreen';
import VaultScreen from '../vaultScreen';
import VaultSaveScreen from '../vaultSaveScreen';
import VaultRescheduleScreen from '../vaultResheduleSreen';
import VaultRescheduleErrorScreen from '../vaultResheduleErrorScreen';
import VirtualVisaCardModal from '../virtualVisaScreen';
import VirtualVisaScreen from '../virtualVisaScreen';
import CreditScreen from '../creditScreen';
import CreditAmountScreen from '../creditAmountScreen';
import SettingsScreen from '../SettingsScreen';
import VisaCardDepositScreen from '../visaCardDepositScreen';
import VisaCardWithdrawScreen from '../visaCardWithdrawScreen';
import LoginScreen from '../loginScreen';
import EnterPinScreen from '../enterPinScreen';
import PhoneCodeScreen from '../phoneCodeScreen';
import SetNewPinScreen from '../setNewPinScreen';
import UnlockPinScreen from '../unlockPinScreen';
import PaymentsScreen from '../paymentsScreen';
import CanalPaymentScreen from '../canalPaymentScreen';
import WoyofalPaymentScreen from '../woyofalPaymentScreen';


const WaveAppModal = ({ show, onHide }) => {
  const { selectedUser, updateUser } = useUserContext();
  const transactions = selectedUser?.transactions || [];

  const [showBalance, setShowBalance] = useState(true);
  
  const [activeScreen, setActiveScreen] = useState(null);

  const [selectedRecipient, setSelectedRecipient] = useState(null);

  const [selectedCreditContact, setSelectedCreditContact] = useState(null);
  
  const prevUserId = useRef(null);
  
  function formatAmount(amount) {
    return Number(amount)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }  


  useEffect(() => {
    if (selectedUser?.id !== prevUserId.current) {
      // ✅ L'utilisateur a vraiment changé
      setActiveScreen('unlock-pin'); // ou 'home'
      setSelectedRecipient(null);
      prevUserId.current = selectedUser?.id;
    }
  }, [selectedUser]);
  

  const actions = [
    {
      label: 'Transfert',
      icon: <i className="fa-solid fa-user fa-2x" style={{ color: '#3f51b5' }}></i>,
      bg: '#e8eaf6',
      disabled: false,
      onClick: () => setActiveScreen('transfer')
    },
    {
      label: 'Paiements',
      icon: <i className="fa-solid fa-cart-shopping fa-2x" style={{ color: '#f57c00' }}></i>,
      bg: '#fff3e0',
      disabled: false,
      onClick: () => setActiveScreen('payments'),
    },
    {
        label: 'Crédit',
        icon: <i className="fa-solid fa-mobile-screen-button fa-2x" style={{ color: '#0288d1' }}></i>,
        bg: '#e1f5fe',
        disabled: false,
        onClick: () => setActiveScreen('credit')
      },      
    {
      label: 'Banque',
      icon: <i className="fa-solid fa-landmark fa-2x" style={{ color: '#d32f2f' }}></i>,
      bg: '#ffebee',
      disabled: true,
    },
    {
      label: 'Cadeaux',
      icon: <i className="fa-solid fa-gift fa-2x" style={{ color: '#388e3c' }}></i>,
      bg: '#e8f5e9',
      disabled: true,
    },
    selectedUser?.vault && {
      label: 'Coffre',
      icon: <i className="fa-solid fa-vault fa-2x" style={{ color: '#ab47bc' }}></i>,
      bg: '#f3e5f5',
      disabled: false,
      onClick: () => setActiveScreen('vault'),
    },
    {
      label: 'Transport',
      icon: <i className="fa-solid fa-bus fa-2x" style={{ color: '#ef6c00' }}></i>,
      bg: '#fff3e0',
      disabled: true
    },
    selectedUser?.virtualVisa && {
      label: 'Carte Visa',
      icon: <i className="fa-brands fa-cc-visa fa-2x" style={{ color: '#1565c0' }}></i>,
      bg: '#e3f2fd',
      disabled: false,
      onClick: () => setActiveScreen('visa'),
    }
  ].filter(Boolean);
  
  
  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop='static'
      keyboard={false}
      dialogClassName="wave-app-dialog"
      contentClassName="border-0"
    >
      <Modal.Body
        className="p-0"
        style={{
          height: 'auto',
          background: 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div className="wave-phone">
          {/* Faux bouton power */}
          <div className="wave-phone-power" />
          {/* Capteur haut */}
          <div className="wave-phone-camera" />

          {/* Contenu scrollable */}
          <div className="wave-scroll">

            {activeScreen === 'transfer' ? (
                <TransferModalContent 
                    onBack={() => setActiveScreen(null)} 
                    onSelectRecipient={(recipient) => {
                        setSelectedRecipient(recipient);
                        setActiveScreen('amount');
                    }}
                />
            ) : activeScreen === 'login' ? (
                <LoginScreen
                  onSubmit={(phone, recovery) => {
                    setActiveScreen(recovery ? 'set-new-pin' : 'enter-pin');
                  }}
                />
            ) : activeScreen === 'amount' && selectedRecipient ? (
                <TransferAmountScreen
                  recipient={selectedRecipient}
                  onBack={() => setActiveScreen('transfer')}
                  onSuccess={() => {
                    setSelectedRecipient(null);
                    setActiveScreen(null); // 👈 retour à la page d'accueil
                  }}
                />
            ) : activeScreen === 'vault' ? (
                    <VaultScreen
                    onBack={() => setActiveScreen(null)}
                    onNavigate={(screen) => setActiveScreen(screen)} // ✅ ici
                />
            ) : activeScreen === 'vault-save' ? (
                <VaultSaveScreen onBack={() => setActiveScreen('vault')} />
            ) : activeScreen === 'vault-reschedule' ? (
                <VaultRescheduleScreen onBack={() => setActiveScreen('vault')} />
            ) : activeScreen === 'vault-reschedule-error' ? (
                <VaultRescheduleErrorScreen onBack={() => setActiveScreen('vault')} />
            ) : activeScreen === 'visa' ? (
                <VirtualVisaScreen onBack={() => setActiveScreen('home')} onNavigate={setActiveScreen} />
            ) : activeScreen === 'credit' && !selectedCreditContact ? (
                <CreditScreen
                  onBack={() => setActiveScreen(null)}
                  onSelectContact={(contact) => setSelectedCreditContact(contact)}
                />
            ) : activeScreen === 'credit' && selectedCreditContact ? (
                <CreditAmountScreen
                    contact={selectedCreditContact}
                    onBack={() => setSelectedCreditContact(null)}
                    onSubmit={(amount) => {
                    const now = new Date();
                    const newTx = {
                        id: `TX${Math.floor(100000 + Math.random() * 900000)}`,
                        date: now.toLocaleString(),
                        dateRaw: now,
                        amount: -Number(amount),
                        type: 'bill_payment',
                        billType: 'Airtime',
                        details: `Achat crédit vers ${selectedCreditContact.phone}`,
                        recipient: selectedCreditContact.phone,
                        balance: selectedUser.balance - Number(amount),
                    };

                    updateUser(selectedUser.id, {
                        transactions: [newTx, ...(selectedUser.transactions || [])],
                        balance: selectedUser.balance - Number(amount),
                    });

                    // Nettoyage
                    setSelectedCreditContact(null);
                    setActiveScreen(null);
                    }}
                />
            ) : activeScreen === 'settings' ? (
                <SettingsScreen
                  onBack={() => setActiveScreen(null)}
                  phone={selectedUser?.phone}
                  onLogout={() => {
                    setActiveScreen('login');
                  }}
                />
            ) : activeScreen === 'pay-canal' ? (
                <CanalPaymentScreen onBack={() => setActiveScreen('payments')} />
            ) : activeScreen === 'payments' ? (
                <PaymentsScreen
                  onBack={() => setActiveScreen(null)}
                  onSelectBiller={(billerName) => {
                    if (billerName === 'canal') {
                      setActiveScreen('pay-canal');
                    } else if (billerName === 'woyofal') {
                      setActiveScreen('pay-woyofal');
                    }
                  }}
                />
            ) : activeScreen === 'pay-woyofal' ? (
                <WoyofalPaymentScreen onBack={() => setActiveScreen('payments')} />
            ) : activeScreen === 'visa-deposit' ? (
                <VisaCardDepositScreen onBack={() => setActiveScreen('visa')} />
            ) : activeScreen === 'visa-withdraw' ? (
                <VisaCardWithdrawScreen onBack={() => setActiveScreen('visa')} />
            ) : activeScreen === 'enter-pin' ? (
                <EnterPinScreen
                  phone={selectedUser?.phone || ''}
                  onSubmit={(value) => {
                    if (value === 'set-new-pin') {
                      setActiveScreen('set-new-pin');
                    } else {
                      setActiveScreen('phone-code');
                    }
                  }}
                  onBack={() => setActiveScreen('login')}
                />
            ) : activeScreen === 'unlock-pin' ? (
              <UnlockPinScreen
                onForgot={() => setActiveScreen('login')}
                onSubmit={() => {
                  setActiveScreen(null); // ou 'home' ou autre écran après succès
                }}
              />
            ) : activeScreen === 'set-new-pin' ? (
                <SetNewPinScreen
                  onBack={() => setActiveScreen('login')}
                  onSuccess={() => {
                    setActiveScreen(null); // ou vers 'home' si tu veux un retour visuel
                  }}
                />
            ) : activeScreen === 'phone-code' ? (
                <PhoneCodeScreen
                  onBack={() => setActiveScreen('login')}
                  onCodeComplete={() => setActiveScreen(null)}
                  onResend={() => console.log('Resend code...')}
                  phone={selectedUser?.phone || ''}
                />
            ) : (
                <>
                    <div>
                        {/* En-tête violet avec paramètres, solde et œil */}
                            <div className="text-white position-relative"
                                style={{
                                backgroundColor: '#5c47d3',
                                borderTopLeftRadius: '30px',
                                borderTopRightRadius: '30px',
                                paddingBottom: '30px'  // ← important pour que la carte ne déborde pas
                                }}
                            >
                            {/* Paramètres */}
                            <i
                                className="fa-solid fa-gear"
                                style={{ position: 'absolute', left: 15, top: 15, fontSize: 20, cursor: 'pointer' }}
                                onClick={() => setActiveScreen('settings')}
                            />
                            {/* Solde */}
                            <div className="text-center pt-4">
                                <div className="fw-bold" style={{ fontSize: 24 }}>
                                {showBalance ? `${formatAmount(selectedUser?.balance) || 0}F` : '•••••••'}{' '}
                                <span onClick={() => setShowBalance(!showBalance)} style={{ cursor: 'pointer' }}>
                                    {showBalance ? (
                                    <i className="fa-solid fa-eye-slash" />
                                    ) : (
                                    <i className="fa-solid fa-eye" />
                                    )}
                                </span>
                                </div>
                            </div>

                            {/* Carte QR stylisée */}
                            <div
                                style={{
                                    background: '#00c6ff',
                                    backgroundImage: 'url("/images/qr-background.png")',
                                    backgroundSize: 'cover',
                                    borderRadius: '25px',
                                    height: '200px',
                                    width: '90%',
                                    margin: '20px auto 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                }}
                                className="text-center"
                            >
                                <div
                                style={{
                                    display: 'inline-block',
                                    background: 'white',
                                    padding: 10,
                                    borderRadius: 10,
                                    position: 'relative',
                                }}
                                >
                                <QRCodeSVG value={selectedUser?.phone || ''} size={120} />
                                <div className="mt-1 text-dark"><i class="fa-solid fa-camera"></i> Scanner</div>
                                </div>
                                <div style={{ position: 'absolute', right: 10, bottom: 5, fontSize: 40 }}>
                                    <img src="/images/logo-app.png" alt="" width={40} />
                                </div>
                            </div>
                        </div>


                        {/* Actions */}
                        <div className="d-flex flex-wrap justify-content-center px-3 py-2">
                        {actions.map(({ label, icon, bg, disabled, onClick }) => (
                            <div
                            key={label}
                            className="text-center mt-2"
                            onClick={!disabled ? onClick : undefined}
                            style={{
                                width: '25%', // 4 éléments par ligne
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                opacity: disabled ? 0.5 : 1
                            }}
                            >
                            <div
                                style={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                background: bg,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: '0 auto'
                                }}
                            >
                                {icon}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: '500', marginTop: 4 }}>{label}</div>
                            </div>
                        ))}
                        </div>
                        <hr className="my-1" />

                        {/* Transactions */}
                        {[...transactions]
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((tx, i) => {
                                const isNegative = tx.amount < 0;
                                const formattedAmount = `${isNegative ? '-' : ''}${Math.abs(tx.amount)}F`;

                                // Déterminer le titre
                                let title = '';
                                if (tx.type === 'transfer') {
                                title = tx.amount > 0
                                    ? `De ${tx.highlight?.name || '---'}`
                                    : `À ${tx.highlight?.name || '---'}`;
                                } else if (tx.type === 'reversalEntry') {
                                    const h = tx.highlight || {};
                                    title = `Transfert ${tx.amount > 0 ? 'à' : 'de'} ${h.name || '---'} ${h.phone || ''} remboursé`;
                                } else if (tx.type === 'deposit') {
                                title = `Dépôt via ${tx.agent || 'Agent'}`;
                                } else if (tx.type === 'withdrawal') {
                                title = `Retrait via ${tx.agent || 'Agent'}`;
                                } else if (tx.type === 'award_credit') {
                                title = `Crédit offert`;
                                } else if (tx.type === 'transferToVault') {
                                title = `Transfert vers coffre`;
                                } else if (tx.type === 'transferToPaymentCardWalletEntry') {
                                title = `Transfert vers carte Visa`;
                                } else if (tx.type === 'transferFromPaymentCardWalletEntry') {
                                    title = 'Transfert depuis carte Visa';
                                } else if (tx.type === 'bill_payment') {
                                if (tx.billType === 'Airtime') {
                                    title = `Achat crédit pour le ${tx.recipient || '---'}`;
                                } else {
                                    title = `Paiement ${tx.billType || 'facture'}`;
                                }
                                } else {
                                title = tx.type;
                                }

                                const dateObj = new Date(tx.dateRaw || tx.date);
                                const dateStr = dateObj.toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'long'
                                });
                                const timeStr = dateObj.toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                                });

                                return (
                                <div
                                    key={i}
                                    className="d-flex justify-content-between align-items-start border-bottom px-2 py-2"
                                >
                                    <div>
                                    <div style={{ fontSize: '14px', color: '#180399', fontWeight: '500' }}>
                                        {title}
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'black' }}>
                                        {dateStr}, {timeStr}
                                    </div>
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#180399', fontWeight: '500' }}>
                                    {formattedAmount}
                                    </div>
                                </div>
                                );
                            })}
                    </div>
                </>
            )}

            
          </div>
          {/* Footer barre 
          <div className="d-flex justify-content-center align-items-center py-1" style={{ borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px', background: '#f5f5f5' }}>
              <div style={{ width: 80, height: 5, backgroundColor: '#ccc', borderRadius: 5 }}></div>
            </div>
            */}
        </div>
        
      </Modal.Body>
      
    </Modal>
  );
};

export default WaveAppModal;
