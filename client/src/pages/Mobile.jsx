import { useState } from 'react';
import { useAddTransaction } from '../hooks/useApi.js';
import { recommendCard } from '../utils/cardOptimiser.js';
import { ALL_CATEGORIES } from '../config/categories.js';
import { CARD_NAMES } from '../config/cards.js';

export function Mobile() {
  const [form, setForm] = useState({
    amount: '', description: '', category: 'Restaurants', type: 'Choice',
    payment_card: 'Amex Gold', trip_tag: '', is_personal_attendance: true, isJTT: false,
  });
  const [saved, setSaved] = useState(false);
  const addTx = useAddTransaction();

  const set = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    if (k === 'category' || k === 'isJTT') {
      const rec = recommendCard(next.category, next.isJTT);
      next.payment_card = rec.card;
      if (next.isJTT) next.type = 'JTT';
    }
    return next;
  });

  const handleSave = async () => {
    if (!form.amount || !form.description) return;
    const today = new Date().toISOString().split('T')[0];
    await addTx.mutateAsync({
      date: today,
      description: form.description,
      amount: Number(form.amount),
      category: form.isJTT ? 'JTT Purchase' : form.category,
      type: form.isJTT ? 'JTT' : form.type,
      payment_card: form.payment_card,
      trip_tag: form.trip_tag || null,
      is_personal_attendance: form.is_personal_attendance ? 1 : 0,
      notes: null, subcategory: null, amex_credit_id: null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setForm(f => ({ ...f, amount: '', description: '' }));
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] p-4 max-w-md mx-auto">
      <div className="text-[#3B82F6] font-bold text-sm mono mb-6">RD Finance · Quick Entry</div>

      {saved && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
          ✓ Saved
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-[#94A3B8] text-sm block mb-1">Amount</label>
          <input
            type="number" inputMode="decimal" placeholder="0.00"
            value={form.amount} onChange={e => set('amount', e.target.value)}
            className="w-full bg-[#1A2236] border border-[#1E293B] rounded-lg px-4 py-4 text-[#F1F5F9] mono text-2xl text-right"
          />
        </div>

        <div>
          <label className="text-[#94A3B8] text-sm block mb-1">Description</label>
          <input
            type="text" placeholder="Merchant / description"
            value={form.description} onChange={e => set('description', e.target.value)}
            className="w-full bg-[#1A2236] border border-[#1E293B] rounded-lg px-4 py-3 text-[#F1F5F9]"
          />
        </div>

        <div>
          <label className="text-[#94A3B8] text-sm block mb-1">Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full bg-[#1A2236] border border-[#1E293B] rounded-lg px-4 py-3 text-[#F1F5F9]">
            {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          {['Income','Core','Choice','JTT'].map(t => (
            <button key={t} onClick={() => set('type', t)}
              className={`flex-1 py-2 rounded-lg text-sm ${form.type === t ? 'bg-[#3B82F6] text-white' : 'bg-[#1A2236] border border-[#1E293B] text-[#94A3B8]'}`}>
              {t}
            </button>
          ))}
        </div>

        <div>
          <label className="text-[#94A3B8] text-sm block mb-1">Card Used</label>
          <select value={form.payment_card} onChange={e => set('payment_card', e.target.value)}
            className="w-full bg-[#1A2236] border border-[#1E293B] rounded-lg px-4 py-3 text-[#F1F5F9]">
            {CARD_NAMES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-3 p-3 bg-[#1A2236] border border-[#1E293B] rounded-lg cursor-pointer">
          <input type="checkbox" checked={form.isJTT} onChange={e => set('isJTT', e.target.checked)}
            className="w-4 h-4 accent-blue-500" />
          <div>
            <div className="text-[#F1F5F9] text-sm">JTT Purchase</div>
            <div className="text-[#475569] text-xs">Switches to Amex BBP, type = JTT</div>
          </div>
        </label>

        {form.type === 'Choice' && form.category.toLowerCase().includes('travel') && (
          <div>
            <label className="text-[#94A3B8] text-sm block mb-1">Trip Tag</label>
            <input type="text" placeholder="e.g. NYC June 2026"
              value={form.trip_tag} onChange={e => set('trip_tag', e.target.value)}
              className="w-full bg-[#1A2236] border border-[#1E293B] rounded-lg px-4 py-3 text-[#F1F5F9]" />
          </div>
        )}

        <button onClick={handleSave}
          className="w-full bg-[#3B82F6] rounded-lg py-4 text-white font-semibold text-lg hover:bg-blue-500 active:scale-95 transition-transform">
          Save
        </button>
      </div>
    </div>
  );
}
