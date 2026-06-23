import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db/schema.js';
import transactionsRouter from './routes/transactions.js';
import summaryRouter from './routes/summary.js';
import ticketsRouter from './routes/tickets.js';
import amexRouter from './routes/amex.js';
import accountsRouter from './routes/accounts.js';
import flagsRouter from './routes/flags.js';
import cardsRouter from './routes/cards.js';
import savingsRouter from './routes/savings.js';
import budgetTargetsRouter from './routes/budgetTargets.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = join(__dirname, '../../client/dist');

const app = express();
const PORT = process.env.PORT || 3001;

// Dev: allow Vite dev server. Prod: same-origin, no CORS needed.
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3001'] }));
app.use(express.json());

initDb();

app.use('/api/transactions', transactionsRouter);
app.use('/api/summary', summaryRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/amex', amexRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/flags', flagsRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/savings', savingsRouter);
app.use('/api/budget-targets', budgetTargetsRouter);
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Serve built React app (production / desktop mode)
if (existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (_req, res) => res.sendFile(join(CLIENT_DIST, 'index.html')));
}

app.listen(PORT, () => {
  const mode = existsSync(CLIENT_DIST) ? 'production' : 'API-only (run npm run dev:client separately)';
  console.log(`RD Finance server :${PORT} [${mode}]`);
});
