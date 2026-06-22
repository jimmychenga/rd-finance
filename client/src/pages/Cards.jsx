import { useState } from 'react';
import { recommendCard } from '../utils/cardOptimiser.js';
import { Card } from '../components/Card.jsx';
import { CARDS } from '../config/cards.js';
import { ALL_CATEGORIES } from '../config/categories.js';

export function Cards() {
  const [query, setQuery] = useState('');
  const rec = query ? recommendCard(query) : null;

  return (
    <div className="p-6">
      <h1 className="text-[#F1F5F9] text-lg font-semibold mb-6">Card Optimiser</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Type a merchant or category..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-[#1A2236] border border-[#1E293B] rounded-lg px-4 py-3 text-[#F1F5F9] placeholder-[#475569]"
        />
        {rec && (
          <div className="mt-3 p-3 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-lg">
            <div className="text-[#F1F5F9] font-medium">Use: {rec.card}</div>
            <div className="text-[#94A3B8] text-sm">{rec.reason}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {ALL_CATEGORIES.slice(0, 21).map(cat => {
          const { card } = recommendCard(cat);
          const cardData = CARDS.find(c => c.name === card);
          return (
            <div key={cat} className="bg-[#1A2236] border border-[#1E293B] rounded-lg p-3 flex justify-between items-center">
              <span className="text-[#F1F5F9] text-sm">{cat}</span>
              <span className="text-xs px-2 py-0.5 rounded-lg text-white" style={{ backgroundColor: cardData?.color || '#6B7280' }}>
                {card.replace('Amex ', '').replace(' Card', '').replace('Wells Fargo ', 'WF ')}
              </span>
            </div>
          );
        })}
      </div>

      <Card>
        <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-4">Card Comparison</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#94A3B8] border-b border-[#1E293B]">
                <th className="text-left py-2 pr-4">Card</th>
                <th className="text-left py-2 pr-4">Annual Fee</th>
                <th className="text-left py-2 pr-4">Best For</th>
                <th className="text-left py-2">Top Reward</th>
              </tr>
            </thead>
            <tbody>
              {CARDS.map(c => (
                <tr key={c.name} className="border-b border-[#1E293B] last:border-0">
                  <td className="py-2 pr-4">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-[#F1F5F9]">{c.name}</span>
                    </span>
                  </td>
                  <td className="py-2 pr-4 mono text-[#94A3B8]">{c.annual_fee > 0 ? `$${c.annual_fee}` : 'None'}</td>
                  <td className="py-2 pr-4 text-[#94A3B8] text-xs">{c.best_for.join(', ')}</td>
                  <td className="py-2 text-[#94A3B8] text-xs">{c.rewards[0]?.multiplier}x {c.rewards[0]?.unit} on {c.rewards[0]?.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
