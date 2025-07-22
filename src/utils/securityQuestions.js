// utils/securityQuestions.js

export const generateSecurityQuestions = (user) => {
  if (!user) return [];

  const txs = user.transactions || [];
  const deposits = txs.filter(tx => tx.type === 'deposit');
  const withdrawals = txs.filter(tx => tx.type === 'withdrawal');
  const transfers = txs.filter(tx => tx.type === 'transfer');
  const payments = txs.filter(tx => tx.type === 'payment' || tx.type === 'bill_payment');
  const allTxs = [...deposits, ...withdrawals, ...transfers, ...payments];

  const frequentContacts = transfers
    .filter(tx => tx.highlight?.name && tx.highlight?.phone)
    .map(tx => `${tx.highlight.name} (${tx.highlight.phone})`);

  const uniqueContacts = Array.from(new Set(frequentContacts));
  const agentTxs = [...deposits, ...withdrawals];
  const agentLocations = Array.from(new Set(agentTxs.map(tx => tx.agentAdress || tx.agent).filter(Boolean)));

  const qList = [];

  // Nom sur le compte
  qList.push({
    id: 'name',
    label: `Quel est le nom associé au compte ?`,
    values: [user.name],
  });

  // Lieu des opérations
  if (agentLocations.length > 0) {
    qList.push({
      id: 'location',
      label: `Où avez-vous effectué votre dernier dépôt ou retrait ?`,
      values: agentLocations.slice(0, 3),
    });
  }

  // Transactions récentes
  if (allTxs.length > 0) {
    const recentTxs = allTxs
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    const txValues = recentTxs.map(t => {
      switch (t.type) {
        case 'deposit': return `dépôt de ${Math.abs(t.amount)}F`;
        case 'withdrawal': return `retrait de ${Math.abs(t.amount)}F`;
        case 'transfer': return `transfert de ${Math.abs(t.amount)}F`;
        case 'bill_payment': return `paiement ${t.billType ?? ''} de ${Math.abs(t.amount)}F`;
        case 'payment': return `paiement marchand de ${Math.abs(t.amount)}F`;
        default: return `${t.type} de ${Math.abs(t.amount)}F`;
      }
    });

    qList.push({
      id: 'tx',
      label: `Indiquez la nature et le montant de l'une des dernières opérations effectuées sur ce compte (dépôt, retrait, transfert, paiement) :`,
      values: txValues,
    });
  }

  // Numéro ID
  if (user.kyc2) {
    qList.push({
      id: 'idNumber',
      label: `Quel est votre numéro d'identification ?`,
      values: [user.idNumber],
    });
  }

  // Contacts récents
  if (uniqueContacts.length > 0) {
    qList.push({
        id: 'contact',
        label: `Nom ou numéro d’une personne avec qui le client a récemment fait des transactions ?`,
        values: uniqueContacts.slice(0, 3),
    });
    }

  // Dernière utilisation
  if (!user.kyc2 && txs.length > 0) {
    const last = new Date(txs[0].date);
    qList.push({
      id: 'lastUse',
      label: `Quand avez-vous utilisé votre compte pour la dernière fois ?`,
      values: [last.toLocaleDateString()],
    });
  }

  // Solde (facultatif)
  if (typeof user.balance === 'number') {
    qList.push({
      id: 'balance',
      label: `Quel est le solde approximatif de votre compte ?`,
      values: [`Environ ${user.balance}F`],
    });
  }

  return qList;
};
