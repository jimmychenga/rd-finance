#!/usr/bin/env python3
"""
Import RD_26.xlsx + Current Chin Tix Tracking.xlsx into rd-finance SQLite.
Run from repo root: python3 server/scripts/import_historical.py
"""

import pandas as pd
import sqlite3
import re
from pathlib import Path

DB = Path(__file__).parent.parent / 'data' / 'rd-finance.db'
BUDGET_XL = Path.home() / 'Downloads' / 'RD 26.xlsx'
JTT_XL = Path.home() / 'Downloads' / 'Current Chin Tix Tracking.xlsx'

MONTH_SHEETS = {
    1: 'January 26',
    2: 'February 2026',
    3: 'March 26',
    4: 'April 26',
    5: 'May 26',
    6: 'June 26',
}

YEAR = 2026

# ── Helpers ───────────────────────────────────────────────────────────────────

def norm(s):
    return re.sub(r'[^a-z0-9 ]', ' ', str(s).lower()).strip()

def safe_float(v):
    try:
        f = float(v)
        return None if pd.isna(f) else f
    except (TypeError, ValueError):
        return None

def month_date(month, day=1):
    return f'{YEAR}-{month:02d}-{day:02d}'

# ── Category matching ─────────────────────────────────────────────────────────

EXPENSE_RULES = [
    (r'housing|^rent$', 'Housing/Rent', 'Core', 'Bilt Mastercard'),
    (r'utilities|ga power|electricity', 'Utilities', 'Core', None),
    (r'^internet$', 'Internet', 'Core', None),
    (r'rent insurance', 'Rent Insurance', 'Core', None),
    (r'^transportation|^gas$', 'Transportation/Gas', 'Core', None),
    (r'alfa insurance', 'Car Insurance', 'Core', None),
    (r'state farm', 'Home Insurance', 'Core', None),
    (r'benefits insurance', 'Benefits Insurance', 'Core', None),
    (r'^groceries$|publix|trader joe|kroger|hmart', 'Groceries', 'Core', 'Amex Gold'),
    (r'hygiene|household|cleaning', 'Household Supplies', 'Core', 'Robinhood Gold Card'),
    (r'dentist|dental|pharmacy|cvs|walgreens|medic', 'Health & Body', 'Core', None),
    (r'^dining|dining out', 'Restaurants', 'Choice', 'Amex Gold'),
    (r'fados|canes|chick fil|great greek|panda|five guys', 'Restaurants', 'Choice', 'Amex Gold'),
    (r'credit card', 'Subscriptions', 'Choice', None),
    (r'subscription service|^subscriptions?$', 'Subscriptions', 'Choice', 'Robinhood Gold Card'),
    (r'bike shop|fitting|clipless|cycling|triathlon|hyrox', 'Sport / Triathlon Gear', 'Choice', 'Robinhood Gold Card'),
    (r'zwift', 'Gym / Fitness', 'Choice', 'Robinhood Gold Card'),
    (r'la fitness|gym|fitness', 'Gym / Fitness', 'Choice', 'Robinhood Gold Card'),
    (r'haircut|grooming|barber', 'Haircut / Grooming', 'Choice', 'Robinhood Gold Card'),
    (r'beech mountain|ski |snowboard', 'Entertainment', 'Choice', None),
    (r'kalshi|polymarket', 'Personal Development', 'Choice', None),
    (r'uber(?! eats| cash)|lyft|rideshare', 'Rideshare', 'Choice', 'Wells Fargo Autograph'),
    (r'marta|transit|subway|metro', 'Transit', 'Choice', 'Wells Fargo Autograph'),
    (r'atl to|lax to|flight|airfare|airline|\d+ to \w+', 'Flights', 'Choice', 'Amex Platinum'),
    (r'hotel|airbnb|hostel|accommodation', 'Hotels', 'Choice', 'Amex Platinum'),
    (r'bilt refund|debt from', 'Transfers / Refunds', 'Choice', None),
    (r'bar |bars |drink|beer|stoneys', 'Bars & Drinks', 'Choice', 'Amex Gold'),
    (r'amazon|prime(?! rib)', 'Subscriptions', 'Choice', 'Robinhood Gold Card'),
    (r'spotify|apple |netflix|hulu|disney|nyt|youtube', 'Subscriptions', 'Choice', 'Robinhood Gold Card'),
    (r'clothing|shoes|apparel|lululemon|saks', 'Clothing', 'Choice', 'Robinhood Gold Card'),
    (r'doordash|grubhub|uber eats|delivery', 'Food Delivery', 'Choice', 'Amex Gold'),
    (r'coffee|dunkin|starbucks', 'Coffee', 'Choice', 'Amex Gold'),
]

INCOME_RULES = [
    (r'^job$', 'Salary', True),
    (r'^taxes$', 'Salary', False),      # negative withholding — bundle with salary
    (r'q\d.*bonus|bonus', 'Bonus', True),
    (r'irs|tax refund', 'Tax Refund', True),
    (r'reimbursement', 'Work Reimbursement', True),
    (r'bilt refund', 'Transfers / Refunds', True),
]

SAVINGS_RULES = [
    (r'roth', 'Roth'),
    (r'401', '401k'),
    (r'hsa', 'HSA'),
    (r'invest', 'Brokerage'),
]


def match_expense(description, raw_category='Choice'):
    d = norm(description)
    for pattern, category, etype, card in EXPENSE_RULES:
        if re.search(pattern, d):
            return category, etype, card
    return description.strip(), raw_category, None


def match_income(description):
    d = norm(description)
    for pattern, category, is_positive in INCOME_RULES:
        if re.search(pattern, d):
            return category, is_positive
    return None, None


def match_savings(name):
    n = norm(name)
    for pattern, stype in SAVINGS_RULES:
        if re.search(pattern, n):
            return stype
    return None


def fuzzy_matches_jtt(description, jtt_event_norms):
    d = norm(description)
    words = [w for w in d.split() if len(w) >= 4]
    for event_norm in jtt_event_norms:
        event_words = [w for w in event_norm.split() if len(w) >= 4]
        for w in words:
            if w in event_norm:
                return True
        for w in event_words:
            if w in d:
                return True
    return False


# ── Import JTT deals ──────────────────────────────────────────────────────────

def import_jtt(conn):
    cur = conn.cursor()
    inserted = 0

    for sheet_name, year in [('JTT 2025', 2025), ('JTT 2026', YEAR)]:
        df = pd.read_excel(JTT_XL, sheet_name=sheet_name)

        # Normalise column names
        sell_col = next((c for c in df.columns if 'sell' in c.lower()), None)
        name_col = 'Event Name'
        date_col = 'Date'
        qty_col = 'Tickets'
        ppt_col = 'Price Per Ticket'
        cost_col = 'Total Purchase Price'
        profit_col = 'Profit'
        source_col = 'Source'
        status_col = 'Status'
        sold_on_col = 'Sold on'

        for _, row in df.iterrows():
            event_name = row.get(name_col)
            if pd.isna(event_name) or str(event_name).strip() == '':
                continue

            # Skip entries with invalid prices (div/0 errors)
            if str(row.get(ppt_col, '')).startswith('#'):
                continue

            raw_date = row.get(date_col)
            if pd.isna(raw_date) or str(raw_date).strip() == '':
                continue

            # Parse event date
            try:
                if isinstance(raw_date, (int, float)):
                    event_date = str(int(raw_date))[:4] + '-01-01'
                    if str(int(raw_date)) == '2027':
                        continue  # skip future year placeholder
                else:
                    import datetime
                    if hasattr(raw_date, 'strftime'):
                        event_date = raw_date.strftime('%Y-%m-%d')
                    else:
                        event_date = str(raw_date)[:10]
            except Exception:
                continue

            status_raw = row.get(status_col)
            if pd.isna(status_raw):
                status = 'Holding'
            else:
                status = str(status_raw).strip().capitalize()
                if status not in ('Sold', 'Holding', 'Lost', 'Refunded'):
                    status = 'Holding'

            qty = safe_float(row.get(qty_col)) or 1
            ppt = safe_float(row.get(ppt_col)) or 0
            total_cost = safe_float(row.get(cost_col)) or round(qty * ppt, 2)
            sell_price = safe_float(row.get(sell_col)) if sell_col else None
            profit_raw = safe_float(row.get(profit_col))

            # For Holding deals, profit is unrealised — store None
            profit = profit_raw if status in ('Sold', 'Lost', 'Refunded') else None
            net_revenue = sell_price if sell_price and sell_price > 0 else None

            source = str(row.get(source_col, '') or '').strip() or None
            sold_on = str(row.get(sold_on_col, '') or '').strip() or None
            if sold_on == 'nan':
                sold_on = None

            event_year = int(event_date[:4]) if event_date else year

            cur.execute('''
                INSERT INTO ticket_deals
                  (event_name, event_date, quantity, price_per_ticket, total_cost,
                   sell_price, net_revenue, profit, source, sold_on, status, year)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            ''', (
                str(event_name).strip(), event_date, int(qty), ppt, total_cost,
                sell_price, net_revenue, profit, source, sold_on, status, event_year
            ))
            inserted += 1

    conn.commit()
    print(f'  JTT deals inserted: {inserted}')
    return inserted


# ── Import monthly budget data ────────────────────────────────────────────────

def import_month(conn, month, sheet_name, jtt_event_norms):
    cur = conn.cursor()
    df = pd.read_excel(BUDGET_XL, sheet_name=sheet_name, header=None)
    tx_inserted = 0
    sav_inserted = 0
    date = month_date(month)

    def insert_tx(description, amount, category, etype, card=None, subcategory=None, notes=None):
        nonlocal tx_inserted
        if amount is None or amount == 0:
            return
        cur.execute('''
            INSERT INTO transactions
              (date, description, amount, category, subcategory, type, payment_card, month, year, notes)
            VALUES (?,?,?,?,?,?,?,?,?,?)
        ''', (date, description, round(amount, 2), category, subcategory, etype, card, month, YEAR, notes))
        tx_inserted += 1

    def insert_sav(stype, amount):
        nonlocal sav_inserted
        if amount and amount > 0:
            cur.execute('''
                INSERT INTO savings (month, year, type, amount)
                VALUES (?,?,?,?)
            ''', (month, YEAR, stype, round(amount, 2)))
            sav_inserted += 1

    # ── 1. Income section (cols 1-2) ─────────────────────────────────────────
    # Rows with Name in col1 and Amount in col2
    # Group consecutive Job/Taxes pairs into net paychecks
    pending_job = None
    paycheck_num = 0

    for i, row in df.iterrows():
        name = row.get(1)
        amount = safe_float(row.get(2))
        if pd.isna(name) or str(name).strip() in ('', 'Name', 'Update as necessary', '1. CAPITAL', 'nan'):
            if pending_job is not None:
                # Flush unpaired job entry
                paycheck_num += 1
                insert_tx(f'Salary #{paycheck_num}', pending_job, 'Salary', 'Income')
                pending_job = None
            continue
        if amount is None:
            continue

        category, is_positive = match_income(str(name))

        if norm(str(name)) == 'job':
            # Start of a paycheck pair
            if pending_job is not None:
                # Previous job had no taxes partner — flush it
                paycheck_num += 1
                insert_tx(f'Salary #{paycheck_num}', pending_job, 'Salary', 'Income')
            pending_job = amount
        elif norm(str(name)) == 'taxes' and pending_job is not None:
            # Net this paycheck
            net = pending_job + amount  # amount is negative
            paycheck_num += 1
            insert_tx(f'Salary #{paycheck_num} (net)', net, 'Salary', 'Income')
            pending_job = None
        elif category is not None:
            # Bonus, refund, reimbursement
            insert_tx(str(name).strip(), amount, category, 'Income')
        else:
            # Potential JTT revenue — check against JTT events
            if amount > 0 and fuzzy_matches_jtt(str(name), jtt_event_norms):
                insert_tx(f'{str(name).strip()} — JTT Revenue', amount, 'JTT Net Revenue', 'Income')
            elif amount > 0:
                insert_tx(str(name).strip(), amount, 'Side Income', 'Income')
            # Skip negatives that don't match anything (noise)

    if pending_job is not None:
        paycheck_num += 1
        insert_tx(f'Salary #{paycheck_num}', pending_job, 'Salary', 'Income')

    # ── 2. Expense section (cols 4-6) ────────────────────────────────────────
    for i, row in df.iterrows():
        name = row.get(4)
        amount = safe_float(row.get(5))
        raw_cat = str(row.get(6, 'Choice')).strip() if pd.notna(row.get(6)) else 'Choice'

        if pd.isna(name) or str(name).strip() in ('', 'Name', 'nan'):
            continue
        if amount is None or amount <= 0:
            continue
        if raw_cat not in ('Core', 'Choice'):
            continue

        name_str = str(name).strip()

        # Check if this expense is a JTT purchase
        if fuzzy_matches_jtt(name_str, jtt_event_norms):
            insert_tx(name_str, amount, 'JTT Purchase', 'JTT', 'Amex Blue Business Plus')
            continue

        category, etype, card = match_expense(name_str, raw_cat)
        insert_tx(name_str, amount, category, etype, card)

    # ── 3. Savings (col 13-14) ───────────────────────────────────────────────
    for i, row in df.iterrows():
        name = row.get(13)
        amount = safe_float(row.get(14))
        if pd.isna(name) or str(name).strip() in ('', 'Name', 'Total', 'Cash', 'nan'):
            continue
        stype = match_savings(str(name))
        if stype and amount and amount > 0:
            insert_sav(stype, amount)

    conn.commit()
    print(f'  {sheet_name}: {tx_inserted} transactions, {sav_inserted} savings entries')
    return tx_inserted


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not DB.exists():
        print(f'ERROR: Database not found at {DB}')
        print('Run: cd server && node src/db/seed.js')
        return

    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    # Clear existing imported data (keep seed data: category_rules, amex_credits)
    cur.execute('DELETE FROM transactions')
    cur.execute('DELETE FROM ticket_deals')
    cur.execute('DELETE FROM savings')
    conn.commit()
    print('Cleared existing transactions/deals/savings.')

    # Build JTT event name index for fuzzy matching
    jtt_2026 = pd.read_excel(JTT_XL, sheet_name='JTT 2026')
    jtt_2025 = pd.read_excel(JTT_XL, sheet_name='JTT 2025')
    all_jtt_events = list(jtt_2026['Event Name'].dropna()) + list(jtt_2025['Event Name'].dropna())
    jtt_event_norms = [norm(str(e)) for e in all_jtt_events if str(e).strip()]
    print(f'JTT event index: {len(jtt_event_norms)} events')

    # Import JTT deals
    print('\nImporting JTT deals...')
    import_jtt(conn)

    # Import monthly budget data
    print('\nImporting monthly transactions...')
    total_tx = 0
    for month, sheet in MONTH_SHEETS.items():
        total_tx += import_month(conn, month, sheet, jtt_event_norms)

    conn.close()
    print(f'\nDone. Total transactions: {total_tx}')
    print('Start the server and open the dashboard to see your data.')


if __name__ == '__main__':
    main()
