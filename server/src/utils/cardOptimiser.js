const RULES = {
  'Housing/Rent': 'Bilt Mastercard',
  'Dining Out': 'Amex Gold',
  'Restaurants': 'Amex Gold',
  'Bars & Drinks': 'Amex Gold',
  'Coffee': 'Amex Gold',
  'Groceries': 'Amex Gold',
  'Food Delivery': 'Amex Gold',
  'Flights': 'Amex Platinum',
  'Hotels': 'Amex Platinum',
  'Travel': 'Amex Platinum',
  'Rideshare': 'Wells Fargo Autograph',
  'Transit': 'Wells Fargo Autograph',
  'Transportation/Gas': 'Wells Fargo Autograph',
  'Subscriptions': 'Robinhood Gold Card',
  'Health & Body': 'Robinhood Gold Card',
  'Clothing': 'Robinhood Gold Card',
};

export function recommendCard(category, isJTTPurchase) {
  if (isJTTPurchase) return 'Amex Blue Business Plus';
  return RULES[category] || 'Robinhood Gold Card';
}
