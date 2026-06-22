import { useState } from 'react';
import { ChevronLeft, ChevronRight, Upload, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import {
  useTransactions, useBudgetTargets, useSummary,
  useUpdateBudgetTarget, useUpdateTransaction, useDeleteTransaction, useAddTransaction,
} from '../hooks/useApi.js';
import { Card } from '../components/Card.jsx';
import { BudgetBar } from '../components/BudgetBar.jsx';
import { CsvImportModal } from '../components/CsvImportModal.jsx';
import { fmt, monthFull } from '../utils/format.js';
import { ALL_CATEGORIES } from '../config/categories.js';
import { CARD_NAMES } from '../config/cards.js';

const NOW = new Date();
const TYPES = ['Income', 'Core', 'Choice', 'Compound', 'JTT'];

const BLANK_TX = {
  date: new Date().toISOString().split('T')[0],
  description: '', amount: '', category: 'Restaurants',
  type: 'Choice', payment_card: '', trip_tag: '', notes: '',
};

function TxRow({ t, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(t);

  if (editing) {
    return (
      <div className="grid grid-cols-[90px_1fr_100px_1fr_80px_100px_auto] gap-2 items-center py-2 border-b border-[#1E293B] bg-[#111827] px-2 rounded-lg text-xs">
        <input type="date" value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}
          className="bg-[#1A2236] border border-[#1E293B] rounded px-1.5 py-1 text-[#F1F5F9]" />
        <input value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
          className="bg-[#1A2236] border border-[#1E293B] rounded px-1.5 py-1 text-[#F1F5F9]" />
        <input type="number" value={draft.amount} onChange={e => setDraft(d => ({ ...d, amount: e.target.value }))}
          className="bg-[#1A2236] border border-[#1E293B] rounded px-1.5 py-1 mono text-[#F1F5F9] text-right" />
        <select value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
          className="bg-[#1A2236] border border-[#1E293B] rounded px-1 py-1 text-[#F1F5F9]">
          {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value }))}
          className="bg-[#1A2236] border border-[#1E293B] rounded px-1 py-1 text-[#F1F5F9]">
          {TYPES.map(tp => <option key={tp}>{tp}</option>)}
        </select>
        <select value={draft.payment_card || ''} onChange={e => setDraft(d => ({ ...d, payment_card: e.target.value }))}
          className="bg-[#1A2236] border border-[#1E293B] rounded px-1 py-1 text-[#F1F5F9]">
          <option value="">— card —</option>
          {CARD_NAMES.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="flex gap-1">
          <button onClick={() => { onSave({ ...draft, amount: Number(draft.amount) }); setEditing(false); }} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
          <button onClick={() => setEditing(false)} className="text-[#94A3B8] hover:text-white"><X size={14} /></button>
        </div>
      </div>
    );
  }

  const amtColor = t.type === 'Income' ? 'text-green-400' : t.type === 'JTT' ? 'text-amber-400' : 'text-[#F1F5F9]';
  return (
    <div className="grid grid-cols-[90px_1fr_100px_1fr_80px_100px_auto] gap-2 items-center py-2 border-b border-[#1E293B] last:border-0 text-sm group hover:bg-[#0A0F1E] rounded px-1">
      <span className="text-[#475569] text-xs mono">{t.date}</span>
      <span className="text-[#F1F5F9] truncate">{t.description}</span>
      <span className={`mono font-medium text-right ${amtColor}`}>{t.type === 'Income' ? '+' : ''}{fmt(t.amount)}</span>
      <span className="text-[#94A3B8] text-xs truncate">{t.category}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded text-center ${t.type === 'Income' ? 'bg-green-500/20 text-green-400' : t.type === 'JTT' ? 'bg-amber-500/20 text-amber-400' : t.type === 'Core' ? 'bg-blue-500/20 text-blue-400' : 'bg-[#1E293B] text-[#94A3B8]'}`}>
        {t.type}
      </span>
      <span className="text-[#475569] text-xs truncate">{t.payment_card || '—'}</span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
        <button onClick={() => { setDraft(t); setEditing(true); }} className="text-[#475569] hover:text-[#94A3B8]"><Pencil size={12} /></button>
        <button onClick={() => onDelete(t.id)} className="text-[#475569] hover:text-red-400"><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

function AddTxRow({ month, year, onDone }) {
  const [form, setForm] = useState({ ...BLANK_TX, month, year });
  const addTx = useAddTransaction();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.description || !form.amount) return;
    const d = new Date(form.date);
    await addTx.mutateAsync({ ...form, amount: Number(form.amount), month: d.getMonth() + 1, year: d.getFullYear() });
    onDone();
  };

  return (
    <div className="grid grid-cols-[90px_1fr_100px_1fr_80px_100px_auto] gap-2 items-center py-2 border-b border-[#3B82F6]/30 bg-[#3B82F6]/5 px-2 rounded-lg text-xs mt-1">
      <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
        className="bg-[#1A2236] border border-[#1E293B] rounded px-1.5 py-1 text-[#F1F5F9]" />
      <input placeholder="Description" value={form.description} onChange={e => set('description', e.target.value)}
        className="bg-[#1A2236] border border-[#1E293B] rounded px-1.5 py-1 text-[#F1F5F9]" />
      <input type="number" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)}
        className="bg-[#1A2236] border border-[#1E293B] rounded px-1.5 py-1 mono text-[#F1F5F9] text-right" />
      <select value={form.category} onChange={e => set('category', e.target.value)}
        className="bg-[#1A2236] border border-[#1E293B] rounded px-1 py-1 text-[#F1F5F9]">
        {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>
      <select value={form.type} onChange={e => set('type', e.target.value)}
        className="bg-[#1A2236] border border-[#1E293B] rounded px-1 py-1 text-[#F1F5F9]">
        {TYPES.map(tp => <option key={tp}>{tp}</option>)}
      </select>
      <select value={form.payment_card} onChange={e => set('payment_card', e.target.value)}
        className="bg-[#1A2236] border border-[#1E293B] rounded px-1 py-1 text-[#F1F5F9]">
        <option value="">— card —</option>
        {CARD_NAMES.map(c => <option key={c}>{c}</option>)}
      </select>
      <div className="flex gap-1">
        <button onClick={save} disabled={addTx.isPending} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
        <button onClick={onDone} className="text-[#94A3B8] hover:text-white"><X size={14} /></button>
      </div>
    </div>
  );
}

export function MonthDetail() {
  const [month, setMonth] = useState(NOW.getMonth() + 1);
  const [year, setYear] = useState(NOW.getFullYear());
  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const { data: transactions = [] } = useTransactions(month, year);
  const { data: summary } = useSummary(month, year);
  const { data: budgetTargets = [] } = useBudgetTargets(month, year);
  const updateTarget = useUpdateBudgetTarget();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();

  const targetMap = Object.fromEntries(budgetTargets.map(t => [t.category, t.target_amount]));
  const byCategory = summary?.byCategory || {};

  const filtered = transactions.filter(t =>
    (!filterType || t.type === filterType) &&
    (!filterCat || t.category === filterCat)
  );

  const jttTxs = transactions.filter(t => t.type === 'JTT');
  const personalTxs = transactions.filter(t => t.type !== 'JTT');

  // Spending categories for budget bars (non-income, non-JTT, have spend)
  const spendCategories = Object.entries(byCategory)
    .filter(([cat, amt]) => amt > 0 && cat !== 'undefined')
    .sort((a, b) => b[1] - a[1]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const setTarget = (category, amount) => {
    updateTarget.mutate({ month, year, category, target_amount: amount });
  };

  return (
    <div className="p-6">
      {showImport && (
        <CsvImportModal
          defaultMonth={month} defaultYear={year}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="text-[#94A3B8] hover:text-white"><ChevronLeft size={18} /></button>
          <h1 className="text-[#F1F5F9] text-lg font-semibold">{monthFull(month)} {year}</h1>
          <button onClick={nextMonth} className="text-[#94A3B8] hover:text-white"><ChevronRight size={18} /></button>
        </div>
        <div className="flex items-center gap-3">
          {/* Summary pills */}
          {summary && (
            <div className="flex gap-3 text-sm">
              <span className="text-[#94A3B8]">Income <span className="mono text-green-400">{fmt(summary.income)}</span></span>
              <span className="text-[#94A3B8]">Core <span className="mono text-[#F1F5F9]">{fmt(summary.core)}</span></span>
              <span className="text-[#94A3B8]">Choice <span className="mono text-[#F1F5F9]">{fmt(summary.choice)}</span></span>
              <span className="text-[#94A3B8]">Cash <span className={`mono ${summary.cash >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(summary.cash)}</span></span>
            </div>
          )}
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1A2236] border border-[#1E293B] rounded-lg text-sm text-[#94A3B8] hover:text-white hover:border-[#475569]">
            <Upload size={14} /> Import CSV
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#3B82F6] rounded-lg text-sm text-white hover:bg-blue-500">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-6">
        {/* Left — Budget bars */}
        <div className="space-y-4">
          <Card>
            <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-2">Budget vs Actual
              <span className="text-[#475569] normal-case ml-2 font-normal">hover to edit targets</span>
            </div>
            <div className="divide-y divide-[#1E293B]">
              {spendCategories.map(([cat, spent]) => (
                <BudgetBar
                  key={cat}
                  category={cat}
                  spent={spent}
                  budget={targetMap[cat] || 0}
                  onSetBudget={amt => setTarget(cat, amt)}
                />
              ))}
              {spendCategories.length === 0 && (
                <div className="text-[#475569] text-sm py-4">No spend data — import CSV to get started.</div>
              )}
            </div>
          </Card>

          {jttTxs.length > 0 && (
            <Card>
              <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-3">
                JTT Activity
                <span className="text-[#475569] normal-case font-normal ml-2">excluded from personal spend</span>
              </div>
              <div className="space-y-1">
                {jttTxs.map(t => (
                  <div key={t.id} className="flex justify-between text-sm">
                    <span className="text-[#94A3B8] truncate">{t.description}</span>
                    <span className="mono text-amber-400 ml-2 shrink-0">{fmt(t.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t border-[#1E293B] font-medium">
                  <span className="text-[#94A3B8]">Total deployed</span>
                  <span className="mono text-amber-400">{fmt(jttTxs.reduce((s, t) => s + t.amount, 0))}</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right — Transaction list */}
        <Card className="p-0 overflow-hidden">
          {/* Filters */}
          <div className="flex items-center gap-3 p-4 border-b border-[#1E293B]">
            <span className="text-[#94A3B8] text-xs">Filter:</span>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="bg-[#111827] border border-[#1E293B] rounded-lg text-xs text-[#94A3B8] px-2 py-1.5">
              <option value="">All types</option>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="bg-[#111827] border border-[#1E293B] rounded-lg text-xs text-[#94A3B8] px-2 py-1.5">
              <option value="">All categories</option>
              {[...new Set(transactions.map(t => t.category))].sort().map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <span className="ml-auto text-[#475569] text-xs mono">{filtered.length} transactions</span>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[90px_1fr_100px_1fr_80px_100px_auto] gap-2 px-4 py-2 text-[#475569] text-xs border-b border-[#1E293B]">
            <span>Date</span><span>Description</span><span className="text-right">Amount</span>
            <span>Category</span><span>Type</span><span>Card</span><span></span>
          </div>

          <div className="p-4 space-y-0">
            {showAdd && (
              <AddTxRow month={month} year={year} onDone={() => setShowAdd(false)} />
            )}
            {filtered.length === 0 && !showAdd && (
              <div className="text-[#475569] text-sm py-8 text-center">
                {transactions.length === 0 ? 'No transactions — import a CSV or add one manually.' : 'No transactions match filters.'}
              </div>
            )}
            {filtered.map(t => (
              <TxRow
                key={t.id}
                t={t}
                onSave={data => updateTx.mutate(data)}
                onDelete={id => deleteTx.mutate(id)}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
