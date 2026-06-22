const RULES = {
  'Housing/Rent': { card: 'Bilt Mastercard', reason: '1x Bilt pts — only card that earns on rent' },
  'Restaurants': { card: 'Amex Gold', reason: '4x MR' },
  'Bars & Drinks': { card: 'Amex Gold', reason: '4x MR (counts as dining)' },
  'Coffee': { card: 'Amex Gold', reason: '4x MR' },
  'Groceries': { card: 'Amex Gold', reason: '4x MR' },
  'Food Delivery': { card: 'Amex Gold', reason: '4x MR' },
  'Flights': { card: 'Amex Platinum', reason: '5x MR' },
  'Hotels': { card: 'Amex Platinum', reason: '5x MR' },
  'Travel': { card: 'Amex Platinum', reason: '5x MR' },
  'Travel Rideshare': { card: 'Amex Platinum', reason: '5x MR' },
  'Rideshare': { card: 'Wells Fargo Autograph', reason: '3x pts' },
  'Transit': { card: 'Wells Fargo Autograph', reason: '3x pts' },
  'Transportation/Gas': { card: 'Wells Fargo Autograph', reason: '3x pts' },
  'Subscriptions': { card: 'Robinhood Gold Card', reason: '3% CB' },
  'Software / Apps': { card: 'Robinhood Gold Card', reason: '3% CB' },
  'Health & Body': { card: 'Robinhood Gold Card', reason: '3% CB' },
  'Gym / Fitness': { card: 'Robinhood Gold Card', reason: '3% CB' },
  'Clothing': { card: 'Robinhood Gold Card', reason: '3% CB' },
  'Shoes': { card: 'Robinhood Gold Card', reason: '3% CB' },
  'JTT Purchase': { card: 'Amex Blue Business Plus', reason: '2x MR — keeps business spend separate' },
};

export function recommendCard(category, isJTT = false) {
  if (isJTT) return { card: 'Amex Blue Business Plus', reason: '2x MR — keeps business spend separate' };
  return RULES[category] || { card: 'Robinhood Gold Card', reason: '3% CB catch-all' };
}
