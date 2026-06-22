export function fmt(amount, opts = {}) {
  const abs = Math.abs(amount);
  const str = abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return opts.sign && amount < 0 ? `-$${str}` : `$${str}`;
}

export function fmtDecimal(amount) {
  return `$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function pct(ratio) {
  return `${Math.round(ratio * 100)}%`;
}

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function monthLabel(m) { return MONTHS[m - 1] || ''; }
export function monthFull(m) { return MONTH_FULL[m - 1] || ''; }
