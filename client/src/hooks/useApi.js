import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BASE = '/api';

async function apiFetch(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function useSummary(month, year) {
  return useQuery({ queryKey: ['summary', month, year], queryFn: () => apiFetch(`/summary?month=${month}&year=${year}`) });
}

export function useYearlySummary(year) {
  return useQuery({ queryKey: ['summary-year', year], queryFn: () => apiFetch(`/summary/year?year=${year}`) });
}

export function useTransactions(month, year) {
  return useQuery({ queryKey: ['transactions', month, year], queryFn: () => apiFetch(`/transactions?month=${month}&year=${year}`) });
}

export function useTickets(year, status) {
  const params = new URLSearchParams();
  if (year) params.set('year', year);
  if (status) params.set('status', status);
  return useQuery({ queryKey: ['tickets', year, status], queryFn: () => apiFetch(`/tickets?${params}`) });
}

export function useTicketAnalytics(year) {
  return useQuery({ queryKey: ['ticket-analytics', year], queryFn: () => apiFetch(`/tickets/analytics?year=${year}`) });
}

export function useAmex(year) {
  return useQuery({ queryKey: ['amex', year], queryFn: () => apiFetch(`/amex?year=${year}`) });
}

export function useAmexRoi(year) {
  return useQuery({ queryKey: ['amex-roi', year], queryFn: () => apiFetch(`/amex/roi?year=${year}`) });
}

export function useAccountHistory(year) {
  return useQuery({ queryKey: ['accounts', year], queryFn: () => apiFetch(`/accounts/history?year=${year}`) });
}

export function useFlags(month, year) {
  return useQuery({ queryKey: ['flags', month, year], queryFn: () => apiFetch(`/flags?month=${month}&year=${year}`) });
}

export function useBudgetTargets(month, year) {
  return useQuery({ queryKey: ['budget-targets', month, year], queryFn: () => apiFetch(`/budget-targets?month=${month}&year=${year}`) });
}

export function useSavings(month, year) {
  return useQuery({ queryKey: ['savings', month, year], queryFn: () => apiFetch(`/savings?month=${month}&year=${year}`) });
}

// Mutations
export function useAddTransaction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: t => apiFetch('/transactions', { method: 'POST', body: t }), onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }) });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: t => apiFetch(`/transactions/${t.id}`, { method: 'PUT', body: t }), onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }) });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: id => apiFetch(`/transactions/${id}`, { method: 'DELETE' }), onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }) });
}

export function useAddTicket() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: d => apiFetch('/tickets', { method: 'POST', body: d }), onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }) });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: d => apiFetch(`/tickets/${d.id}`, { method: 'PUT', body: d }), onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }) });
}

export function useUpdateBudgetTarget() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: d => apiFetch('/budget-targets', { method: 'PUT', body: d }), onSuccess: () => qc.invalidateQueries({ queryKey: ['budget-targets'] }) });
}

export function useUpdateAmexCredit() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: d => apiFetch(`/amex/${d.id}`, { method: 'PUT', body: d }), onSuccess: () => qc.invalidateQueries({ queryKey: ['amex'] }) });
}

export function useSaveAccountSnapshot() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: d => apiFetch('/accounts/snapshot', { method: 'POST', body: d }), onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }) });
}

export function useBulkImport() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: rows => apiFetch('/transactions/bulk', { method: 'POST', body: rows }), onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }) });
}

export function useCategorise() {
  return useMutation({ mutationFn: rows => apiFetch('/transactions/categorise', { method: 'POST', body: rows }) });
}
