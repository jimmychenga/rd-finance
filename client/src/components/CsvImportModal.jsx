import { useState, useCallback } from 'react';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { useCategorise, useBulkImport } from '../hooks/useApi.js';
import { ALL_CATEGORIES } from '../config/categories.js';
import { CARD_NAMES } from '../config/cards.js';
import { fmt } from '../utils/format.js';

const TYPES = ['Income', 'Core', 'Choice', 'Compound', 'JTT'];

// Try to detect which column is which from headers
function detectColumns(headers) {
  const h = headers.map(h => String(h).toLowerCase());
  return {
    date: h.findIndex(x => x.includes('date') || x.includes('posted') || x.includes('trans')),
    description: h.findIndex(x => x.includes('desc') || x.includes('merchant') || x.includes('name') || x.includes('memo')),
    amount: h.findIndex(x => x.includes('amount') || x.includes('debit') || x.includes('charge')),
  };
}

function parseRow(row, colMap) {
  const rawAmount = String(row[colMap.amount] ?? '').replace(/[$,()]/g, '');
  const amount = Math.abs(parseFloat(rawAmount) || 0);
  const rawDate = String(row[colMap.date] ?? '').trim();
  // Attempt to normalise date to YYYY-MM-DD
  let date = rawDate;
  const m = rawDate.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const yr = m[3].length === 2 ? '20' + m[3] : m[3];
    date = `${yr}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  }
  const d = new Date(date);
  return {
    date,
    description: String(row[colMap.description] ?? '').trim(),
    amount,
    month: d.getMonth() + 1,
    year: d.getFullYear(),
  };
}

export function CsvImportModal({ onClose, defaultMonth, defaultYear }) {
  const [step, setStep] = useState('upload'); // upload → review → done
  const [rows, setRows] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const categorise = useCategorise();
  const bulkImport = useBulkImport();

  const processFile = useCallback((file) => {
    setError('');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        if (!result.data.length) { setError('No rows found in CSV.'); return; }
        const headers = result.meta.fields || [];
        const colMap = detectColumns(headers);
        if (colMap.amount < 0 || colMap.description < 0) {
          setError(`Could not detect columns. Headers found: ${headers.join(', ')}`);
          return;
        }

        const parsed = result.data
          .map(r => parseRow(r, { date: headers[colMap.date], description: headers[colMap.description], amount: headers[colMap.amount] }))
          .filter(r => r.amount > 0 && r.description);

        try {
          const categorised = await categorise.mutateAsync(parsed);
          setRows(categorised.map((r, i) => ({ ...r, _id: i, keep: true })));
          setStep('review');
        } catch {
          setError('Auto-categorisation failed. Try again.');
        }
      },
      error: () => setError('Could not parse file. Make sure it is a valid CSV.'),
    });
  }, [categorise]);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileInput = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const setRowField = (id, field, value) => {
    setRows(rs => rs.map(r => r._id === id ? { ...r, [field]: value } : r));
  };

  const handleImport = async () => {
    const toImport = rows
      .filter(r => r.keep && r.amount > 0 && r.description)
      .map(({ _id, keep, matched, ...r }) => ({
        ...r,
        is_personal_attendance: 1,
        notes: null,
        subcategory: null,
        amex_credit_id: null,
      }));
    await bulkImport.mutateAsync(toImport);
    setStep('done');
  };

  const kept = rows.filter(r => r.keep).length;
  const unmatched = rows.filter(r => r.keep && !r.matched).length;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-[#1E293B] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1E293B]">
          <div>
            <div className="text-[#F1F5F9] font-semibold">Import CSV</div>
            <div className="text-[#94A3B8] text-xs">Bank or credit card statement export</div>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 'upload' && (
            <div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragOver ? 'border-[#3B82F6] bg-[#3B82F6]/10' : 'border-[#1E293B] hover:border-[#475569]'}`}
              >
                <Upload size={32} className="mx-auto mb-3 text-[#94A3B8]" />
                <div className="text-[#F1F5F9] font-medium mb-1">Drop your CSV here</div>
                <div className="text-[#94A3B8] text-sm mb-4">or click to browse</div>
                <label className="cursor-pointer bg-[#1A2236] border border-[#1E293B] rounded-lg px-4 py-2 text-sm text-[#F1F5F9] hover:border-[#3B82F6]">
                  Choose file
                  <input type="file" accept=".csv" className="hidden" onChange={onFileInput} />
                </label>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
                </div>
              )}
              <div className="mt-4 p-3 bg-[#1A2236] rounded-lg text-[#94A3B8] text-xs space-y-1">
                <div className="font-medium text-[#F1F5F9]">Supported formats</div>
                <div>Capital One: Date, Transaction, Amount columns</div>
                <div>Amex: Date, Description, Amount columns</div>
                <div>Any CSV with date + description + amount columns</div>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div>
              <div className="flex items-center gap-4 mb-4 p-3 bg-[#1A2236] rounded-lg">
                <div className="text-sm"><span className="mono text-[#F1F5F9]">{kept}</span> <span className="text-[#94A3B8]">to import</span></div>
                <div className="text-sm"><span className="mono text-amber-400">{unmatched}</span> <span className="text-[#94A3B8]">need review</span></div>
                <div className="ml-auto text-[#94A3B8] text-xs">Uncheck rows to skip · Edit category/type/card inline</div>
              </div>

              <div className="space-y-0">
                <div className="grid grid-cols-[auto_1fr_auto_1fr_1fr_1fr_auto] gap-2 text-[#94A3B8] text-xs px-2 py-1">
                  <div></div><div>Description</div><div>Amount</div><div>Category</div><div>Type</div><div>Card</div><div></div>
                </div>

                {rows.map(row => (
                  <div
                    key={row._id}
                    className={`grid grid-cols-[auto_1fr_auto_1fr_1fr_1fr_auto] gap-2 items-center px-2 py-1.5 rounded-lg text-sm ${row.keep ? (row.matched ? '' : 'bg-amber-500/5 border border-amber-500/20') : 'opacity-40'}`}
                  >
                    <input
                      type="checkbox"
                      checked={row.keep}
                      onChange={e => setRowField(row._id, 'keep', e.target.checked)}
                      className="accent-blue-500"
                    />
                    <div>
                      <div className="text-[#F1F5F9] truncate">{row.description}</div>
                      <div className="text-[#475569] text-xs">{row.date}</div>
                    </div>
                    <div className="mono text-[#F1F5F9] text-right">{fmt(row.amount)}</div>
                    <select
                      value={row.category}
                      onChange={e => setRowField(row._id, 'category', e.target.value)}
                      className="bg-[#1A2236] border border-[#1E293B] rounded px-1 py-0.5 text-xs text-[#F1F5F9]"
                    >
                      {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select
                      value={row.type}
                      onChange={e => setRowField(row._id, 'type', e.target.value)}
                      className="bg-[#1A2236] border border-[#1E293B] rounded px-1 py-0.5 text-xs text-[#F1F5F9]"
                    >
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <select
                      value={row.payment_card || ''}
                      onChange={e => setRowField(row._id, 'payment_card', e.target.value)}
                      className="bg-[#1A2236] border border-[#1E293B] rounded px-1 py-0.5 text-xs text-[#F1F5F9]"
                    >
                      <option value="">— card —</option>
                      {CARD_NAMES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    {!row.matched && <AlertCircle size={12} className="text-amber-400 shrink-0" />}
                    {row.matched && <Check size={12} className="text-green-500 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-green-400" />
              </div>
              <div className="text-[#F1F5F9] font-semibold text-lg mb-1">Import complete</div>
              <div className="text-[#94A3B8]">{kept} transactions added · dashboard will refresh</div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'review' && (
          <div className="p-4 border-t border-[#1E293B] flex justify-between items-center">
            <button onClick={() => setStep('upload')} className="text-sm text-[#94A3B8] hover:text-white">
              ← Back
            </button>
            <button
              onClick={handleImport}
              disabled={kept === 0 || bulkImport.isPending}
              className="px-5 py-2 bg-[#3B82F6] rounded-lg text-sm text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {bulkImport.isPending ? 'Importing…' : `Import ${kept} transactions`}
            </button>
          </div>
        )}
        {step === 'done' && (
          <div className="p-4 border-t border-[#1E293B] flex justify-end">
            <button onClick={onClose} className="px-5 py-2 bg-[#3B82F6] rounded-lg text-sm text-white hover:bg-blue-500">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
