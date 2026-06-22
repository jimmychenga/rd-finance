import { Router } from 'express';
import { getDb } from '../db/schema.js';

const router = Router();

const CARD_FEES = { 'Amex Platinum': 895, 'Amex Gold': 325 };

router.get('/', (req, res) => {
  const { year } = req.query;
  const db = getDb();
  const rows = year
    ? db.prepare('SELECT * FROM amex_credits WHERE year=? ORDER BY card, period, period_label').all(Number(year))
    : db.prepare('SELECT * FROM amex_credits ORDER BY card, period, period_label').all();
  res.json(rows);
});

router.get('/roi', (req, res) => {
  const { year } = req.query;
  if (!year) return res.status(400).json({ error: 'year required' });
  const db = getDb();
  const credits = db.prepare('SELECT card, SUM(used_amount) as used, SUM(max_amount) as max FROM amex_credits WHERE year=? GROUP BY card').all(Number(year));
  const result = credits.map(c => ({
    card: c.card,
    annualFee: CARD_FEES[c.card] || 0,
    creditsUsed: c.used,
    creditsMax: c.max,
    netValue: c.used - (CARD_FEES[c.card] || 0),
    projectedValue: c.max - (CARD_FEES[c.card] || 0),
    status: c.used >= (CARD_FEES[c.card] || 0) ? 'Profitable' : c.used >= (CARD_FEES[c.card] || 0) * 0.9 ? 'Break-even' : 'Losing',
  }));
  res.json(result);
});

router.put('/:id', (req, res) => {
  const { used_amount, is_used } = req.body;
  getDb().prepare('UPDATE amex_credits SET used_amount=@used_amount, is_used=@is_used WHERE id=@id').run({ used_amount, is_used: is_used ? 1 : 0, id: req.params.id });
  res.json({ ok: true });
});

export default router;
