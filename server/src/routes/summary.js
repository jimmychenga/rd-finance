import { Router } from 'express';
import { getDb } from '../db/schema.js';

const router = Router();

const FUN_CATEGORIES = ['Restaurants', 'Bars & Drinks', 'Food Delivery', 'Coffee', 'Entertainment'];

function sumByType(txs, type) {
  return txs.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);
}

function calcMoneyMap(income, savings) {
  let score = 0;
  if (income > 0) {
    if ((savings['401k'] || 0) / income >= 0.15) score++;
    if ((savings['Roth'] || 0) / income >= 0.15) score++;
    if ((savings['HSA'] || 0) / income >= 0.10) score++;
  }
  return Math.min(score, 3);
}

router.get('/', (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ error: 'month and year required' });
  const db = getDb();
  const txs = db.prepare('SELECT * FROM transactions WHERE month=? AND year=?').all(Number(month), Number(year));
  const savingsRows = db.prepare('SELECT type, SUM(amount) as total FROM savings WHERE month=? AND year=? GROUP BY type').all(Number(month), Number(year));
  const savings = Object.fromEntries(savingsRows.map(r => [r.type, r.total]));
  const income = sumByType(txs, 'Income');
  const core = sumByType(txs, 'Core');
  const choice = sumByType(txs, 'Choice');
  const jtt = sumByType(txs, 'JTT');
  const compound = Object.values(savings).reduce((s, v) => s + v, 0);
  const cash = income - core - choice - compound;
  const funSpend = txs.filter(t => FUN_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0);
  const byCategory = {};
  txs.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = 0;
    byCategory[t.category] += t.amount;
  });
  res.json({
    income, core, choice, jtt, compound, cash, savings,
    funSpend, funSpendPct: income > 0 ? funSpend / income : 0,
    byCategory,
    moneyMapScore: calcMoneyMap(income, savings),
  });
});

router.get('/year', (req, res) => {
  const { year } = req.query;
  if (!year) return res.status(400).json({ error: 'year required' });
  const db = getDb();
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const txs = db.prepare('SELECT * FROM transactions WHERE month=? AND year=?').all(m, Number(year));
    const income = sumByType(txs, 'Income');
    const core = sumByType(txs, 'Core');
    const choice = sumByType(txs, 'Choice');
    const jtt = sumByType(txs, 'JTT');
    const funSpend = txs.filter(t => FUN_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0);
    months.push({ month: m, income, core, choice, jtt, funSpend });
  }
  res.json(months);
});

export default router;
