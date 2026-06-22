export const ACCOUNTS = [
  { name: 'Capital One Checking', institution: 'Capital One', type: 'checking', is_liquid: true },
  { name: 'Capital One Savings', institution: 'Capital One', type: 'savings', is_liquid: true },
  { name: 'Capital One Emergency Fund', institution: 'Capital One', type: 'savings', is_liquid: true },
  { name: 'Amex Checking', institution: 'American Express', type: 'checking', is_liquid: true },
  { name: 'Robinhood Brokerage', institution: 'Robinhood', type: 'brokerage', is_liquid: true },
  { name: 'Robinhood Roth IRA', institution: 'Robinhood', type: 'roth', is_liquid: true },
  { name: 'Fidelity HSA', institution: 'Fidelity', type: 'hsa', is_liquid: false },
  { name: 'Fidelity 401k', institution: 'Fidelity', type: '401k', is_liquid: false },
];

export const LIQUID_ACCOUNTS = ACCOUNTS.filter(a => a.is_liquid);
export const ILLIQUID_ACCOUNTS = ACCOUNTS.filter(a => !a.is_liquid);
