import { Router } from 'express';
import { getDb } from '../db/schema.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(db_accounts());
});

function db_accounts() {
  return [
    { name: 'Capital One Checking', institution: 'Capital One', type: 'checking', is_liquid: true },
    { name: 'Capital One Savings', institution: 'Capital One', type: 'savings', is_liquid: true },
    { name: 'Capital One Emergency Fund', institution: 'Capital One', type: 'savings', is_liquid: true },
    { name: 'Amex Checking', institution: 'American Express', type: 'checking', is_liquid: true },
    { name: 'Robinhood Brokerage', institution: 'Robinhood', type: 'brokerage', is_liquid: true },
    { name: 'Robinhood Roth IRA', institution: 'Robinhood', type: 'roth', is_liquid: true },
    { name: 'Fidelity HSA', institution: 'Fidelity', type: 'hsa', is_liquid: false },
    { name: 'Fidelity 401k', institution: 'Fidelity', type: '401k', is_liquid: false },
  ];
}

router.post('/snapshot', (req, res) => {
  const db = getDb();
  const { snapshots, month, year } = req.body; // snapshots: [{ account_name, balance, notes }]
  const date = `${year}-${String(month).padStart(2, '0')}-01`;
  const insert = db.prepare(`
    INSERT INTO account_snapshots (account_name, account_type, institution, balance, is_liquid, snapshot_date, month, year, notes)
    VALUES (@account_name, @account_type, @institution, @balance, @is_liquid, @snapshot_date, @month, @year, @notes)
  `);
  const insertMany = db.transaction(rows =>
    rows.forEach(s => insert.run({ ...s, snapshot_date: date, month, year }))
  );
  insertMany(snapshots);
  res.json({ ok: true });
});

router.get('/history', (req, res) => {
  const { year } = req.query;
  const db = getDb();
  const rows = year
    ? db.prepare('SELECT * FROM account_snapshots WHERE year=? ORDER BY month ASC').all(Number(year))
    : db.prepare('SELECT * FROM account_snapshots ORDER BY year ASC, month ASC').all();
  res.json(rows);
});

export default router;
