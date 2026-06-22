export const CATEGORIES = {
  Core: [
    'Housing/Rent', 'Utilities', 'Internet', 'Rent Insurance',
    'Car Insurance', 'Home Insurance', 'Benefits Insurance',
    'Transportation/Gas', 'Groceries', 'Health & Body',
  ],
  Choice: [
    'Restaurants', 'Bars & Drinks', 'Food Delivery', 'Coffee',
    'Entertainment', 'Live Events',
    'Flights', 'Hotels', 'Travel Rideshare', 'Travel Misc',
    'Gym / Fitness', 'Sport / Triathlon Gear', 'Haircut / Grooming', 'Pharmacy',
    'Clothing', 'Shoes', 'Accessories',
    'Subscriptions', 'Software / Apps', 'Membership',
    'Rideshare', 'Transit',
    'Household Supplies', 'Furniture / Décor',
    'Courses / Books', 'Personal Development',
  ],
  Compound: ['401k', 'HSA', 'Roth IRA', 'Brokerage'],
  JTT: ['JTT Purchase', 'JTT Revenue', 'JTT Fees'],
  Income: ['Salary', 'Bonus', 'Tax Refund', 'Work Reimbursement', 'JTT Net Revenue', 'Side Income', 'Transfers / Refunds'],
};

export const FUN_CATEGORIES = ['Restaurants', 'Bars & Drinks', 'Food Delivery', 'Coffee', 'Entertainment'];
export const DINING_CATEGORIES = ['Restaurants', 'Bars & Drinks', 'Food Delivery', 'Coffee'];

export const ALL_CATEGORIES = Object.values(CATEGORIES).flat();
