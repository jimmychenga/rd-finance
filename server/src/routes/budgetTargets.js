import { Router } from 'express';
import { getDb } from '../db/schema.js';

const router = Router();

router.get('/', (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ error: 'month and year required' });
  res.json(getDb().prepare('SELECT * FROM budget_targets WHERE month=? AND year=?').all(Number(month), Number(year)));
});

router.put('/', (req, res) => {
  const db = getDb();
  const { month, year, category, target_amount } = req.body;
  db.prepare(`
    INSERT INTO budget_targets (month, year, category, target_amount)
    VALUES (@month, @year, @category, @target_amount)
    ON CONFLICT(month, year, category) DO UPDATE SET target_amount=excluded.target_amount
  `).run({ month, year, category, target_amount });
  res.json({ ok: true });
});

export default router;
