import { Router } from 'express';
import { getDb } from '../db/schema.js';

const router = Router();

router.get('/', (req, res) => {
  const { year, status } = req.query;
  const db = getDb();
  let sql = 'SELECT * FROM ticket_deals WHERE 1=1';
  const params = [];
  if (year) { sql += ' AND year=?'; params.push(Number(year)); }
  if (status) { sql += ' AND status=?'; params.push(status); }
  sql += ' ORDER BY event_date ASC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/analytics', (req, res) => {
  const { year } = req.query;
  const db = getDb();
  const base = year ? 'WHERE year=?' : 'WHERE 1=1';
  const p = year ? [Number(year)] : [];

  const deals = db.prepare(`SELECT * FROM ticket_deals ${base}`).all(...p);
  const sold = deals.filter(d => d.status === 'Sold');
  const holding = deals.filter(d => d.status === 'Holding');

  const realisedPnl = sold.reduce((s, d) => s + (d.profit || 0), 0);
  const capitalAtRisk = holding.reduce((s, d) => s + d.total_cost, 0);
  const winRate = sold.length > 0 ? sold.filter(d => d.profit > 0).length / sold.length : 0;
  const avgProfit = sold.length > 0 ? realisedPnl / sold.length : 0;

  // Source leaderboard
  const bySource = {};
  sold.forEach(d => {
    if (!bySource[d.source]) bySource[d.source] = { count: 0, profit: 0 };
    bySource[d.source].count++;
    bySource[d.source].profit += d.profit || 0;
  });
  const sourceLeaderboard = Object.entries(bySource)
    .map(([source, v]) => ({ source, ...v, avgProfit: v.profit / v.count }))
    .sort((a, b) => b.avgProfit - a.avgProfit);

  // Platform leaderboard
  const byPlatform = {};
  sold.forEach(d => {
    const p = d.sold_on || 'Unknown';
    if (!byPlatform[p]) byPlatform[p] = { count: 0, profit: 0 };
    byPlatform[p].count++;
    byPlatform[p].profit += d.profit || 0;
  });
  const platformLeaderboard = Object.entries(byPlatform)
    .map(([platform, v]) => ({ platform, ...v, avgProfit: v.profit / v.count }))
    .sort((a, b) => b.profit - a.profit);

  // Best/worst deals
  const sortedByProfit = [...sold].sort((a, b) => (b.profit || 0) - (a.profit || 0));
  const topDeals = sortedByProfit.slice(0, 5);
  const worstDeals = sortedByProfit.slice(-5).reverse();

  res.json({
    realisedPnl, capitalAtRisk, totalDeals: deals.length,
    soldCount: sold.length, holdingCount: holding.length,
    winRate, avgProfit,
    sourceLeaderboard, platformLeaderboard,
    topDeals, worstDeals,
  });
});

router.post('/', (req, res) => {
  const db = getDb();
  const d = req.body;
  const stmt = db.prepare(`
    INSERT INTO ticket_deals (event_name, artist, venue, event_date, purchase_date, quantity, price_per_ticket, total_cost, buy_fees, source, sell_price, sell_fees, net_revenue, profit, sold_on, status, year, budget_month, notes)
    VALUES (@event_name, @artist, @venue, @event_date, @purchase_date, @quantity, @price_per_ticket, @total_cost, @buy_fees, @source, @sell_price, @sell_fees, @net_revenue, @profit, @sold_on, @status, @year, @budget_month, @notes)
  `);
  const info = stmt.run(d);
  res.json({ id: info.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const d = req.body;
  db.prepare(`
    UPDATE ticket_deals SET event_name=@event_name, artist=@artist, venue=@venue, event_date=@event_date, purchase_date=@purchase_date, quantity=@quantity, price_per_ticket=@price_per_ticket, total_cost=@total_cost, buy_fees=@buy_fees, source=@source, sell_price=@sell_price, sell_fees=@sell_fees, net_revenue=@net_revenue, profit=@profit, sold_on=@sold_on, status=@status, year=@year, budget_month=@budget_month, notes=@notes WHERE id=@id
  `).run({ ...d, id: req.params.id });
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM ticket_deals WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
