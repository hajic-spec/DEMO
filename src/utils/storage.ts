import { INITIAL_ADMIN_STORE } from '../data/seedData';
import type { AdminStore, Lead } from '../types/relief';

export const ADMIN_STORAGE_KEY = 'rp_admin_store_v1';

export function loadAdminStore(): AdminStore {
  if (typeof window === 'undefined') {
    return structuredClone(INITIAL_ADMIN_STORE);
  }
  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_STORE));
      return structuredClone(INITIAL_ADMIN_STORE);
    }
    const parsed = JSON.parse(raw) as Partial<AdminStore>;
    return {
      leads: Array.isArray(parsed.leads) ? parsed.leads : INITIAL_ADMIN_STORE.leads,
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes : INITIAL_ADMIN_STORE.quotes,
      invoices: Array.isArray(parsed.invoices) ? parsed.invoices : INITIAL_ADMIN_STORE.invoices,
      events: Array.isArray(parsed.events) ? parsed.events : INITIAL_ADMIN_STORE.events,
      clients: Array.isArray(parsed.clients) ? parsed.clients : INITIAL_ADMIN_STORE.clients,
    };
  } catch {
    return structuredClone(INITIAL_ADMIN_STORE);
  }
}

export function saveAdminStore(store: AdminStore): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota errors gracefully
  }
}

export function appendLeadToStore(leadInput: Omit<Lead, 'id' | 'createdAt' | 'status'>): Lead {
  const store = loadAdminStore();
  const newLead: Lead = {
    ...leadInput,
    id: 'DEM-' + Date.now().toString().slice(-5),
    createdAt: new Date().toISOString().slice(0, 10),
    status: 'Nouvelle',
  };
  const updated: AdminStore = {
    ...store,
    leads: [newLead, ...store.leads],
  };
  saveAdminStore(updated);
  return newLead;
}

export function resetAdminStore(): AdminStore {
  const fresh = structuredClone(INITIAL_ADMIN_STORE);
  saveAdminStore(fresh);
  return fresh;
}
