import { Router } from 'express';
import { getDb } from '../db/schema.js';
import { generateFlags } from '../utils/flagGenerator.js';

const router = Router();

router.get('/', (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ error: 'month and year required' });
  const db = getDb();

  // Generate fresh flags
  const txs = db.prepare('SELECT * FROM transactions WHERE month=? AND year=?').all(Number(month), Number(year));
  const prevTxs = db.prepare('SELECT * FROM transactions WHERE month=? AND year=?').all(Number(month) - 1, Number(year));
  const savingsRows = db.prepare('SELECT type, SUM(amount) as total FROM savings WHERE month=? AND year=? GROUP BY type').all(Number(month), Number(year));
  const savings = Object.fromEntries(savingsRows.map(r => [r.type, r.total]));
  const amexCredits = db.prepare('SELECT * FROM amex_credits WHERE year=? AND used_amount < max_amount').all(Number(year));
  const jttDeals = db.prepare("SELECT * FROM ticket_deals WHERE status='Holding' AND year=?").all(Number(year));

  const flags = generateFlags({ txs, prevTxs, savings, amexCredits, jttDeals, month: Number(month), year: Number(year) });

  // Also return any manually stored, non-dismissed flags
  const stored = db.prepare('SELECT * FROM alerts WHERE month=? AND year=? AND is_dismissed=0').all(Number(month), Number(year));

  res.json([...flags, ...stored].slice(0, 4));
});

router.delete('/:id', (req, res) => {
  getDb().prepare('UPDATE alerts SET is_dismissed=1 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
