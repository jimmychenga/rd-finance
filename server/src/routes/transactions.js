import { Router } from 'express';
import { getDb } from '../db/schema.js';
import { matchCategory } from '../utils/categoryMatcher.js';

const router = Router();

router.get('/', (req, res) => {
  const { month, year } = req.query;
  const db = getDb();
  let rows;
  if (month && year) {
    rows = db.prepare('SELECT * FROM transactions WHERE month=? AND year=? ORDER BY date DESC').all(Number(month), Number(year));
  } else if (year) {
    rows = db.prepare('SELECT * FROM transactions WHERE year=? ORDER BY date DESC').all(Number(year));
  } else {
    rows = db.prepare('SELECT * FROM transactions ORDER BY date DESC LIMIT 200').all();
  }
  res.json(rows);
});

router.post('/', (req, res) => {
  const db = getDb();
  const t = req.body;
  const dateObj = new Date(t.date);
  const month = t.month ?? dateObj.getMonth() + 1;
  const year = t.year ?? dateObj.getFullYear();
  const stmt = db.prepare(`
    INSERT INTO transactions (date, description, amount, category, subcategory, type, payment_card, amex_credit_id, trip_tag, is_personal_attendance, notes, month, year)
    VALUES (@date, @description, @amount, @category, @subcategory, @type, @payment_card, @amex_credit_id, @trip_tag, @is_personal_attendance, @notes, @month, @year)
  `);
  const info = stmt.run({ ...t, month, year });
  res.json({ id: info.lastInsertRowid });
});

router.post('/bulk', (req, res) => {
  const db = getDb();
  const rows = req.body; // array of transaction objects
  const stmt = db.prepare(`
    INSERT INTO transactions (date, description, amount, category, subcategory, type, payment_card, trip_tag, is_personal_attendance, notes, month, year)
    VALUES (@date, @description, @amount, @category, @subcategory, @type, @payment_card, @trip_tag, @is_personal_attendance, @notes, @month, @year)
  `);
  const insertMany = db.transaction(txs => txs.forEach(t => stmt.run(t)));
  insertMany(rows);
  res.json({ inserted: rows.length });
});

// Auto-categorise a parsed CSV row batch — returns suggestions, does not insert
router.post('/categorise', (req, res) => {
  const rows = req.body;
  const suggestions = rows.map(row => ({
    ...row,
    ...matchCategory(row.description),
  }));
  res.json(suggestions);
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const t = req.body;
  db.prepare(`
    UPDATE transactions SET date=@date, description=@description, amount=@amount, category=@category, subcategory=@subcategory, type=@type, payment_card=@payment_card, trip_tag=@trip_tag, notes=@notes WHERE id=@id
  `).run({ ...t, id: req.params.id });
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM transactions WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
