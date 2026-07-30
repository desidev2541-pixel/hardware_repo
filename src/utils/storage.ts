import { ErpDataState } from '../types/erp';
import { initialErpState } from '../data/initialData';

const STORAGE_KEY = 'hardware_factory_erp_data_v1';

export function loadErpState(): ErpDataState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialErpState;
    const parsed = JSON.parse(raw);
    return {
      products: parsed.products || initialErpState.products,
      components: parsed.components || initialErpState.components,
      purchaseOrders: parsed.purchaseOrders || initialErpState.purchaseOrders,
      qcLogs: parsed.qcLogs || initialErpState.qcLogs,
      clients: parsed.clients || initialErpState.clients,
      users: parsed.users || initialErpState.users,
      roles: parsed.roles || initialErpState.roles,
    };
  } catch (err) {
    console.error('Failed to parse local ERP state:', err);
    return initialErpState;
  }
}

export function saveErpState(state: ErpDataState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save ERP state:', err);
  }
}

export function resetErpState(): ErpDataState {
  localStorage.removeItem(STORAGE_KEY);
  return initialErpState;
}
