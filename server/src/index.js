import express from 'express';
import cors from 'cors';
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

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
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

app.listen(PORT, () => console.log(`RD Finance server running on :${PORT}`));
