import { initDb, getDb } from './schema.js';

initDb();
const db = getDb();

// ── Accounts ──────────────────────────────────────────────────────────────────
// (account metadata lives in client config; snapshots are entered monthly via UI)
// No seed needed — accounts are defined in client/src/config/accounts.js

// ── Category rules ────────────────────────────────────────────────────────────
const categoryRules = [
  // Core
  { pattern: 'rent|bilt', category: 'Housing/Rent', type: 'Core', card: 'Bilt Mastercard' },
  { pattern: 'ga power|georgia power', category: 'Utilities', type: 'Core', card: null },
  { pattern: 'xfinity|att |internet', category: 'Internet', type: 'Core', card: null },
  { pattern: 'alfa insurance', category: 'Car Insurance', type: 'Core', card: null },
  { pattern: 'state farm', category: 'Home Insurance', type: 'Core', card: null },
  // Groceries
  { pattern: 'publix', category: 'Groceries', type: 'Core', card: 'Amex Gold' },
  { pattern: 'trader joe', category: 'Groceries', type: 'Core', card: 'Amex Gold' },
  { pattern: 'hmart|h mart', category: 'Groceries', type: 'Core', card: 'Amex Gold' },
  { pattern: 'kroger', category: 'Groceries', type: 'Core', card: 'Amex Gold' },
  // Dining
  { pattern: "fados|park 82|hierloom|canes|chick.fil|maccies|great greek|panda|five guys", category: 'Restaurants', type: 'Choice', card: 'Amex Gold' },
  { pattern: 'grubhub|doordash|uber eats', category: 'Food Delivery', type: 'Choice', card: 'Amex Gold' },
  { pattern: 'dunkin', category: 'Coffee', type: 'Choice', card: 'Amex Gold' },
  { pattern: 'starbucks', category: 'Coffee', type: 'Choice', card: 'Amex Gold' },
  { pattern: 'beer|bar |stoneys|hair of the dog|half pint|dead rabbit', category: 'Bars & Drinks', type: 'Choice', card: 'Amex Gold' },
  // Rideshare / transit
  { pattern: 'uber', category: 'Rideshare', type: 'Choice', card: 'Wells Fargo Autograph' },
  { pattern: 'lyft', category: 'Rideshare', type: 'Choice', card: 'Wells Fargo Autograph' },
  { pattern: 'marta|transit|subway', category: 'Transit', type: 'Choice', card: 'Wells Fargo Autograph' },
  // Subscriptions
  { pattern: 'spotify', category: 'Subscriptions', type: 'Choice', card: 'Robinhood Gold Card' },
  { pattern: 'apple ', category: 'Subscriptions', type: 'Choice', card: 'Robinhood Gold Card' },
  { pattern: 'nyt|new york times', category: 'Subscriptions', type: 'Choice', card: 'Robinhood Gold Card' },
  { pattern: 'amazon prime', category: 'Subscriptions', type: 'Choice', card: 'Robinhood Gold Card' },
  // Health
  { pattern: 'la fitness', category: 'Health & Body', type: 'Choice', card: 'Robinhood Gold Card' },
  { pattern: 'zwift', category: 'Health & Body', type: 'Choice', card: 'Robinhood Gold Card' },
  { pattern: 'dentist|dental', category: 'Health & Body', type: 'Core', card: null },
  { pattern: 'cvs|walgreens', category: 'Health & Body', type: 'Choice', card: null },
  // JTT sources
  { pattern: 'dice|ticketmaster|axs|showclix|insomniac|front gate', category: 'JTT Purchase', type: 'JTT', card: 'Amex Blue Business Plus' },
  // Entertainment (personal)
  { pattern: 'framework|basement|club space', category: 'Entertainment', type: 'Choice', card: null },
];

const insertRule = db.prepare(`
  INSERT OR IGNORE INTO category_rules (merchant_pattern, category, type, suggested_card)
  VALUES (@pattern, @category, @type, @card)
`);
const insertRules = db.transaction(() => categoryRules.forEach(r => insertRule.run(r)));
insertRules();

// ── Amex Credits 2026 ─────────────────────────────────────────────────────────
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const amexCredits = [
  // Platinum annual
  { card: 'Amex Platinum', benefit_name: 'TSA/Global Entry', period: 'annual', period_label: '2026', max_amount: 120, used_amount: 120, year: 2026 },
  { card: 'Amex Platinum', benefit_name: 'Clear', period: 'annual', period_label: '2026', max_amount: 209, used_amount: 209, year: 2026 },
  { card: 'Amex Platinum', benefit_name: 'Airline Incidental', period: 'annual', period_label: '2026', max_amount: 200, used_amount: 200, year: 2026 },
  // Hotel quarterly
  { card: 'Amex Platinum', benefit_name: 'Hotel Credit', period: 'quarterly', period_label: 'Q1', max_amount: 300, used_amount: 300, year: 2026 },
  { card: 'Amex Platinum', benefit_name: 'Hotel Credit', period: 'quarterly', period_label: 'Q2', max_amount: 300, used_amount: 300, year: 2026 },
  { card: 'Amex Platinum', benefit_name: 'Hotel Credit', period: 'quarterly', period_label: 'Q3', max_amount: 300, used_amount: 0, year: 2026 },
  { card: 'Amex Platinum', benefit_name: 'Hotel Credit', period: 'quarterly', period_label: 'Q4', max_amount: 300, used_amount: 0, year: 2026 },
  // Saks semi-annual
  { card: 'Amex Platinum', benefit_name: 'Saks', period: 'semi-annual', period_label: 'H1', max_amount: 50, used_amount: 50, year: 2026 },
  { card: 'Amex Platinum', benefit_name: 'Saks', period: 'semi-annual', period_label: 'H2', max_amount: 50, used_amount: 0, year: 2026 },
  // Lululemon quarterly
  { card: 'Amex Platinum', benefit_name: 'Lululemon', period: 'quarterly', period_label: 'Q1', max_amount: 75, used_amount: 75, year: 2026 },
  { card: 'Amex Platinum', benefit_name: 'Lululemon', period: 'quarterly', period_label: 'Q2', max_amount: 75, used_amount: 75, year: 2026 },
  { card: 'Amex Platinum', benefit_name: 'Lululemon', period: 'quarterly', period_label: 'Q3', max_amount: 75, used_amount: 0, year: 2026 },
  { card: 'Amex Platinum', benefit_name: 'Lululemon', period: 'quarterly', period_label: 'Q4', max_amount: 75, used_amount: 0, year: 2026 },
  // Resy quarterly + semi-annual
  { card: 'Amex Platinum', benefit_name: 'Resy', period: 'quarterly', period_label: 'Q1', max_amount: 100, used_amount: 100, year: 2026 },
  { card: 'Amex Platinum', benefit_name: 'Resy', period: 'quarterly', period_label: 'Q2', max_amount: 100, used_amount: 58, year: 2026 },
  { card: 'Amex Platinum', benefit_name: 'Resy', period: 'quarterly', period_label: 'Q3', max_amount: 100, used_amount: 0, year: 2026 },
  { card: 'Amex Platinum', benefit_name: 'Resy', period: 'quarterly', period_label: 'Q4', max_amount: 100, used_amount: 0, year: 2026 },
  { card: 'Amex Platinum', benefit_name: 'Resy Bonus', period: 'semi-annual', period_label: 'H1', max_amount: 50, used_amount: 50, year: 2026 },
  { card: 'Amex Platinum', benefit_name: 'Resy Bonus', period: 'semi-annual', period_label: 'H2', max_amount: 50, used_amount: 0, year: 2026 },
  // Gold monthly credits (Jan–Dec 2026)
  ...months.flatMap((m, i) => [
    { card: 'Amex Gold', benefit_name: 'Uber Cash', period: 'monthly', period_label: m, max_amount: 10, used_amount: i < 6 ? 10 : 0, year: 2026 },
    { card: 'Amex Gold', benefit_name: 'Dunkin', period: 'monthly', period_label: m, max_amount: 7, used_amount: i < 6 ? 7 : 0, year: 2026 },
    { card: 'Amex Gold', benefit_name: 'Grubhub', period: 'monthly', period_label: m, max_amount: 10, used_amount: i < 6 ? 10 : 0, year: 2026 },
  ]),
];

const insertCredit = db.prepare(`
  INSERT OR IGNORE INTO amex_credits
    (card, benefit_name, period, period_label, max_amount, used_amount, year)
  VALUES
    (@card, @benefit_name, @period, @period_label, @max_amount, @used_amount, @year)
`);
const insertCredits = db.transaction(() => amexCredits.forEach(c => insertCredit.run(c)));
insertCredits();

console.log('Seed complete: category rules + Amex credits loaded.');
console.log('Next: import transactions from RD_26.xlsx and ticket data via the app CSV import.');
