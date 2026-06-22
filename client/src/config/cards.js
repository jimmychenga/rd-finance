export const CARDS = [
  {
    name: 'Amex Platinum', issuer: 'American Express', annual_fee: 895,
    best_for: ['Travel', 'Flights', 'Hotels'], color: '#6B7280',
    rewards: [{ category: 'Flights', multiplier: 5, unit: 'MR' }, { category: 'Hotels', multiplier: 5, unit: 'MR' }, { category: 'Other', multiplier: 1, unit: 'MR' }],
  },
  {
    name: 'Amex Gold', issuer: 'American Express', annual_fee: 325,
    best_for: ['Dining Out', 'Restaurants', 'Groceries', 'Bars'], color: '#D97706',
    rewards: [{ category: 'Restaurants', multiplier: 4, unit: 'MR' }, { category: 'Groceries', multiplier: 4, unit: 'MR' }, { category: 'Other', multiplier: 1, unit: 'MR' }],
  },
  {
    name: 'Amex Blue Business Plus', issuer: 'American Express', annual_fee: 0,
    best_for: ['JTT Purchases', 'Business'], color: '#2563EB',
    rewards: [{ category: 'All', multiplier: 2, unit: 'MR' }],
    note: 'Use for all JTT ticket purchases',
  },
  {
    name: 'Bilt Mastercard', issuer: 'Bilt / Wells Fargo', annual_fee: 0,
    best_for: ['Housing/Rent'], color: '#7C3AED',
    rewards: [{ category: 'Rent', multiplier: 1, unit: 'Bilt pts' }, { category: 'Dining', multiplier: 3, unit: 'Bilt pts' }, { category: 'Travel', multiplier: 2, unit: 'Bilt pts' }],
  },
  {
    name: 'Robinhood Gold Card', issuer: 'Robinhood', annual_fee: 50,
    best_for: ['Subscriptions', 'Everything else'], color: '#10B981',
    rewards: [{ category: 'All', multiplier: 3, unit: '% CB' }],
  },
  {
    name: 'Wells Fargo Autograph', issuer: 'Wells Fargo', annual_fee: 0,
    best_for: ['Rideshare', 'Transit', 'Gas'], color: '#DC2626',
    rewards: [{ category: 'Dining', multiplier: 3, unit: 'pts' }, { category: 'Travel', multiplier: 3, unit: 'pts' }, { category: 'Transit', multiplier: 3, unit: 'pts' }, { category: 'Gas', multiplier: 3, unit: 'pts' }],
  },
  {
    name: 'Amex Delta', issuer: 'American Express', annual_fee: 0,
    best_for: ['Delta flights'], color: '#9333EA',
    rewards: [{ category: 'Delta flights', multiplier: 2, unit: 'miles' }],
  },
  {
    name: 'Discover It', issuer: 'Discover', annual_fee: 0,
    best_for: ['Rotating categories'], color: '#F97316',
    rewards: [{ category: 'Rotating 5%', multiplier: 5, unit: '% CB' }],
  },
];

export const CARD_NAMES = CARDS.map(c => c.name);
