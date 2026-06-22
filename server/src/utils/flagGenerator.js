const FUN_CATS = ['Restaurants', 'Bars & Drinks', 'Food Delivery', 'Coffee', 'Entertainment'];
const GROCERY_CATS = ['Groceries'];
const DINING_CATS = ['Restaurants', 'Bars & Drinks', 'Food Delivery'];

function sum(txs, cats) {
  return txs.filter(t => cats.includes(t.category)).reduce((s, t) => s + t.amount, 0);
}

function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

export function generateFlags({ txs, prevTxs, savings, amexCredits, jttDeals, month }) {
  const flags = [];
  const income = txs.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
  const funSpend = sum(txs, FUN_CATS);
  const funPct = income > 0 ? funSpend / income : 0;

  if (funPct > 0.25) {
    flags.push({ severity: 'warning', message: `Fun spend is ${Math.round(funPct * 100)}% of income this month — target is 25%` });
  }

  const groceries = sum(txs, GROCERY_CATS);
  const prevGroceries = sum(prevTxs, GROCERY_CATS);
  const dining = sum(txs, DINING_CATS);
  const prevDining = sum(prevTxs, DINING_CATS);
  if (prevGroceries > 0 && groceries < prevGroceries * 0.7 && dining >= prevDining * 0.9) {
    const delta = Math.round(prevGroceries - groceries);
    flags.push({ severity: 'info', message: `Groceries dropped $${delta} vs last month while dining stayed high — substitution pattern detected` });
  }

  if (!savings['Roth'] || savings['Roth'] === 0) {
    flags.push({ severity: 'warning', message: `No Roth IRA contribution this month` });
  }

  const expiring = amexCredits.filter(c => daysUntil(c.expires_at) <= 30 && c.used_amount < c.max_amount);
  expiring.slice(0, 2).forEach(c => {
    const remaining = c.max_amount - c.used_amount;
    flags.push({ severity: 'warning', message: `Amex ${c.benefit_name} — $${remaining.toFixed(0)} expires in ${daysUntil(c.expires_at)} days` });
  });

  const capitalAtRisk = jttDeals.reduce((s, d) => s + d.total_cost, 0);
  if (capitalAtRisk > 1000) {
    flags.push({ severity: 'info', message: `$${capitalAtRisk.toLocaleString()} deployed in ${jttDeals.length} unsold JTT events` });
  }

  return flags.slice(0, 4);
}
