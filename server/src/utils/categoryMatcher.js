import { getDb } from '../db/schema.js';

let _rules = null;
function getRules() {
  if (!_rules) {
    _rules = getDb().prepare('SELECT * FROM category_rules').all();
  }
  return _rules;
}

export function matchCategory(description) {
  const desc = description.toLowerCase();
  for (const rule of getRules()) {
    try {
      const regex = new RegExp(rule.merchant_pattern, 'i');
      if (regex.test(desc)) {
        return {
          category: rule.category,
          type: rule.type,
          payment_card: rule.suggested_card,
          matched: true,
        };
      }
    } catch {
      // skip invalid regex patterns
    }
  }
  return { category: 'Uncategorised', type: 'Choice', payment_card: null, matched: false };
}
