import { Router } from 'express';
import { getDb } from '../db/schema.js';

const router = Router();

router.get('/', (req, res) => {
  const { month, year } = req.query;
  const db = getDb();
  const rows = (month && year)
    ? db.prepare('SELECT * FROM savings WHERE month=? AND year=?').all(Number(month), Number(year))
    : db.prepare('SELECT * FROM savings WHERE year=? ORDER BY month').all(Number(year));
  res.json(rows);
});

router.post('/', (req, res) => {
  const db = getDb();
  const info = db.prepare('INSERT INTO savings (month, year, type, amount, notes) VALUES (@month, @year, @type, @amount, @notes)').run(req.body);
  res.json({ id: info.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  getDb().prepare('UPDATE savings SET type=@type, amount=@amount, notes=@notes WHERE id=@id').run({ ...req.body, id: req.params.id });
  res.json({ ok: true });
});

export default router;
