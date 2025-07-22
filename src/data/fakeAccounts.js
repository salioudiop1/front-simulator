import { getYesterdayDateTime } from '../utils/dateUtils';

const yesterday = new Date(Date.now() - 86400000);
const oneYearLater = new Date(yesterday);
oneYearLater.setFullYear(yesterday.getFullYear() + 1);

const vaultTime = "13:00:00Z";
const formatDateISO = (d) => d.toISOString().split('T')[0];

const vaultLockedUntil = `${formatDateISO(yesterday)}T${vaultTime}`;
const plannedUnlock = `${formatDateISO(oneYearLater)}T${vaultTime}`;


const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const activatedDate = `${yesterday.getDate()} ${months[yesterday.getMonth()]} ${yesterday.getFullYear()}`;

const expiryDateObj = new Date(yesterday);
expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 3);
const expiryDate = `${String(expiryDateObj.getMonth() + 1).padStart(2, '0')} / ${expiryDateObj.getFullYear()}`;


export const fakeUsers = [
  {
    id: 1,
    name: "Amina",
    kyc_name: "Aminata Sy",
    gender: "F",
    dob: "21/02/2000",
    phone: "+221770001122",
    expiryDate: "21/05/2028",
    idNumber: "2 999 2003 00036",
    idFrontUrl: "/images/recto2.jpeg",
    idBackUrl:"/images/verso.jpeg",
    balance: 1500,
    amountPending: 0,
    kyc2: true,
    photo: true,
    appVersion: "25.04.04-70bf5c",
    multiAccount: false,
    promoIneligible: false,
    vault: true,
    gifts: false,
    virtualVisa: true, // important pour afficher le bouton
    virtualVisaCard: {
      balance: 1000,
      last4: "5370",
      expiry: expiryDate,
      activatedDate:activatedDate,
      activated: true,
      blocked: false,
      locked: false,
      deleted: false,
      history: [
        /*{
          label: "Paiement à Netflix",
          amount: -15000,
          date: "2023-05-10T08:50:00Z"
        },
        {
          label: "Paiement à Apple Music",
          amount: -5000,
          date: "2023-05-09T16:23:00Z"
        }*/
      ]
    },
    deletedVisaCards: [],   
    userHistory: [],
    escalationHistory: [],
    transactions: [
      {
        type: "transfer",
        id: "TX100010",
        amount: -1000,
        highlight: { name: "Coumba Diouf", phone: "+221771114455" },
        date: getYesterdayDateTime("15:00:00"),
        balance: 1500
      },
      {
        id: "TX100023",
        type: "bill_payment",
        billType: "Woyofal",
        amount: -1000,
        date: getYesterdayDateTime("14:00:00"),
        balance: 2500,
        recipient: "14256622706", // compteur
        token: "0644 8718 5914 2910 1949",
        kwh: "12.1",
        tokenRaw: "06448718591429101949",
        partnerId: "250525204957014138",
        status: "SUCCESS"
      },      
      {
        id: "TX123456",
        type: "transferToPaymentCardWalletEntry",
        amount: -1000,
        date: getYesterdayDateTime("13:30:00"),
        balance: 3500
      },      
      {
        type: "transferToVault",
        id: "TX123456",
        amount: -2000,
        date: getYesterdayDateTime("13:00:00"),
        balance: 4500
      },      
      {
        type: "deposit",
        id: "TX100001",
        agent: "Agent Demba",
        agentAdress: "Dakar Liberté 6",
        agentPhone: "+221770009999",
        amount: 5000,
        date: getYesterdayDateTime("12:30:00"),
        balance: 6500
      },
      {
        type: "transfer",
        id: "TX100002",
        amount: -1000,
        highlight: { name: "Cheikh Gaye", phone: "+221771112233" },
        date: getYesterdayDateTime("12:00:00"),
        balance: 1500
      },
      {
        type: "withdrawal",
        id: "TX100003",
        agent: "Agent Demba",
        agentAdress: "Dakar Liberté 6",
        agentPhone: "+221770009999",
        amount: -1500,
        date: getYesterdayDateTime("11:30:00"),
        balance: 2500
      },
      {
        type: "award_credit",
        amount: 4000,
        date: getYesterdayDateTime("11:00:00"),
        reason: "Compensation for service disruption",
        balance: 4000
      }      
    ],
    billPayCodes: [
      {
        type: 'Woyofal',
        date: getYesterdayDateTime("20:49:00"),
        amount: '1.000F',
        code: '0644 8718 5914 2910 1949'
      }
    ],
    agent: null,
    merchant: {
      id: 'M0001',
      businessName: 'Aminata Boulangerie',
      location: 'Dakar Medina',
      category: 'Retail',
      balance: 300,
      transactions: [
        {
          type: "merchant_payment",
          id: "TX100004",
          customer: "Cheikh Gaye",
          customerPhone: "+221771112233",
          amount: 300,
          date: getYesterdayDateTime("11:30:00"),
          balance: 300
        }
      ]      
    },
    restrictions: [
     {
        title: 'Security Challenge',
        reason: 'Connexion suspecte sur un nouveau appareil',
        blockedBy: 'System',
        since: '2025-20-07',
        icon: '⏳',
        color: 'bg-warning text-dark',
        actions: ['Clear'],
      }
    ],
    vaultBalance: 2000, // en francs CFA
    vaultLocked: true,
    vaultLockedUntil: plannedUnlock,
    hasChangedVaultUnlockDate: false,
    modified: false,
    vaultHistory: [
      {
        lockedOn: vaultLockedUntil,
        plannedUnlock: plannedUnlock,
        amount: 2000
      }
    ],
  },
  {
    id: 2,
    name: "Cheikh Gaye",
    phone: "+221771112233",
    balance: 2700,
    kyc2: false,
    photo: false,
    appVersion: "25.03.15",
    multiAccount: false,
    promoIneligible: false,
    vault: false,
    gifts: false,
    virtualVisa: false,
    userHistory: [],
    escalationHistory: [],
    transactions: [
      {
        type: "transfer",
        id: "TX100011",
        amount: 1000,
        highlight: { name: "Coumba Diouf", phone: "+221771114455" },
        date: getYesterdayDateTime("15:30:00"),
        balance: 2700
      },
      {
        type: "transfer",
        id: "TX100002",
        amount: 1000,
        highlight: { name: "Aminata Sy", phone: "+221770001122" },
        date: getYesterdayDateTime("12:00:00"),
        balance: 1700
      },
      {
        type: "payment",
        id: "TX100004",
        merchant: "Aminata Boulangerie",
        merchantPhone: "+221770001122",
        amount: -300,
        date: getYesterdayDateTime("11:30:00"),
        balance: 700
      },
      {
        type: "award_credit",
        id: "TX100005",
        amount: 1000,
        date: getYesterdayDateTime("11:00:00"),
        reason: "Compensation for service disruption",
        balance: 1000
      }  
    ],
    billPayCodes: [],
    agent: null,
    merchant: null,
    restrictions: []
  },
  {
    id: 3,
    name: "Demba Ndiaye",
    kyc_name: "Demba Ndiaye",
    phone: "+221770009999",
    dob: "21/02/2000",
    expiryDate: "21/05/2028",
    idNumber: "2 999 2003 00036",
    idFrontUrl: "/images/recto2.jpeg",
    idBackUrl:"/images/verso.jpeg",
    balance: 0,
    kyc2: true,
    photo: true,
    appVersion: "25.04.01",
    multiAccount: false,
    promoIneligible: false,
    vault: false,
    gifts: false,
    virtualVisa: false,
    userHistory: [],
    escalationHistory: [],
    transactions: [],
    billPayCodes: [],
    agent: {
      id: 'A0001',
      shopName: 'Agent Demba',
      address: 'Dakar Liberté 6',
      balance: 1000,
      commission: 0,
      type: 'REGULAR',
      users: [
        { name: 'Demba Diop', role: 'Primary', phone: '+221770009999' }
      ],
      transactions: [
        {
          type: "agent_deposit",
          id: "TX100001",
          user: "Aminata Sy",
          userPhone: "+221770001122",
          amount: -5000,
          date: getYesterdayDateTime("12:30:00"),
          balance: 1000
        },
        {
          type: "agent_withdrawal",
          id: "TX100003",
          user: "Aminata Sy",
          userPhone: "+221770001122",
          amount: 1500,
          date: getYesterdayDateTime("11:30:00"),
          balance: 6500
        }
      ]      
    },
    merchant: null,
    restrictions: [
      {
        title: 'Dormancy Block',
        reason: 'Le compte est inactif depuis plus de 180 jours',
        blockedBy: 'System',
        since: '2024-11-01',
        icon: '⏳',
        color: 'bg-warning text-dark',
        actions: ['Unblock'],
      }
    ],
  },
  {
    id: 4,
    name: "Coumba Diouf",
    phone: "+221771114455",
    balance: 0,
    kyc2: false,
    photo: false,
    appVersion: "25.03.15",
    multiAccount: false,
    promoIneligible: false,
    vault: false,
    gifts: false,
    virtualVisa: false,
    userHistory: [],
    escalationHistory: [],
    transactions: [
      {
        type: "transfer",
        id: "TX100011",
        amount: -1000,
        highlight: { name: "Cheikh Gaye", phone: "+221771112233" },
        date: getYesterdayDateTime("15:30:00"),
        balance: 0
      },
      {
        type: "transfer",
        id: "TX100010",
        amount: 1000,
        highlight: { name: "Aminata Sy", phone: "+221770001122" },
        date: getYesterdayDateTime("15:00:00"),
        balance: 1000
      },
    ],
    billPayCodes: [],
    agent: null,
    merchant: null,
    restrictions: []
  },
];
