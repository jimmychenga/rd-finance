import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
mkdirSync(DATA_DIR, { recursive: true });

export const DB_PATH = join(DATA_DIR, 'rd-finance.db');

let _db;
export function getDb() {
  if (!_db) _db = new Database(DB_PATH);
  return _db;
}

export function initDb() {
  const db = getDb();
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      type TEXT CHECK(type IN ('Income','Core','Choice','Compound','JTT')),
      payment_card TEXT,
      amex_credit_id INTEGER,
      trip_tag TEXT,
      is_personal_attendance BOOLEAN DEFAULT 1,
      notes TEXT,
      month INTEGER,
      year INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS budget_targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      category TEXT NOT NULL,
      target_amount DECIMAL(10,2),
      UNIQUE(month, year, category)
    );

    CREATE TABLE IF NOT EXISTS savings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      type TEXT CHECK(type IN ('401k','HSA','Roth','Brokerage')),
      amount DECIMAL(10,2) NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS ticket_deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL,
      artist TEXT,
      venue TEXT,
      event_date DATE NOT NULL,
      purchase_date DATE,
      quantity INTEGER NOT NULL,
      price_per_ticket DECIMAL(10,2) NOT NULL,
      total_cost DECIMAL(10,2) NOT NULL,
      buy_fees DECIMAL(10,2) DEFAULT 0,
      source TEXT,
      sell_price DECIMAL(10,2),
      sell_fees DECIMAL(10,2) DEFAULT 0,
      net_revenue DECIMAL(10,2),
      profit DECIMAL(10,2),
      sold_on TEXT,
      status TEXT CHECK(status IN ('Holding','Sold','Lost','Refunded')) DEFAULT 'Holding',
      year INTEGER NOT NULL,
      budget_month INTEGER,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS amex_credits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card TEXT NOT NULL,
      benefit_name TEXT NOT NULL,
      period TEXT CHECK(period IN ('monthly','quarterly','semi-annual','annual')),
      period_label TEXT,
      max_amount DECIMAL(10,2) NOT NULL,
      used_amount DECIMAL(10,2) DEFAULT 0,
      year INTEGER NOT NULL,
      expires_at DATE,
      is_used BOOLEAN DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS account_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_name TEXT NOT NULL,
      account_type TEXT,
      institution TEXT NOT NULL,
      balance DECIMAL(10,2) NOT NULL,
      is_liquid BOOLEAN DEFAULT 1,
      snapshot_date DATE NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS category_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      merchant_pattern TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      type TEXT,
      suggested_card TEXT
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT CHECK(severity IN ('info','warning','danger')),
      month INTEGER,
      year INTEGER,
      is_dismissed BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database initialised.');
}
