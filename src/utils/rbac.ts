import { RoleDefinition, ErpTabId, ErpUser } from '../types/erp';

export const ALL_ERP_TABS: { id: ErpTabId; name: string; category: string; description: string }[] = [
  { id: 'dashboard', name: 'Factory Overview', category: 'Executive', description: 'Real-time KPIs, throughput charts & system bottlenecks' },
  { id: 'products', name: 'Finished Goods Catalog', category: 'Inventory', description: 'Product SKUs, Bill of Materials (BOM) & Finished Stock' },
  { id: 'components', name: 'Component Inventory', category: 'Inventory', description: 'Raw metals, cast parts & supplier reorder levels' },
  { id: 'kanban', name: '12-Stage Kanban Board', category: 'Production', description: 'Visual pipeline for part movement across 12 operation stages' },
  { id: 'orders', name: 'Purchase Orders', category: 'Sales & Purchasing', description: 'Client PO tracking, order entry & dispatch status' },
  { id: 'matrix', name: 'Part Tracking Matrix', category: 'Production', description: 'Part-by-part completion matrix across all active POs' },
  { id: 'terminal', name: 'Shop Floor Terminal', category: 'Operations', description: 'Operator stage check-in, quantity logging & defect flags' },
  { id: 'qc', name: 'QC Defect Logs', category: 'Quality', description: 'Defect logging, pass/fail inspection history & audit trails' },
  { id: 'users', name: 'Users & RBAC Roles', category: 'Administration', description: 'User accounts, role creation & module access permission matrix' },
  { id: 'clients', name: 'Clients Directory', category: 'Sales', description: 'Customer profiles, delivery addresses & tax references' },
];

export const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'role-super-admin',
    name: 'SUPER_ADMIN',
    description: 'Developer / Software Maintainer level. Root system override, software diagnostics & RBAC architecture control.',
    isSystemRole: true,
    roleBadgeColor: 'bg-purple-900 text-purple-200 border-purple-700',
    allowedTabs: [
      'dashboard',
      'products',
      'components',
      'kanban',
      'orders',
      'matrix',
      'terminal',
      'qc',
      'users',
      'clients',
    ],
  },
  {
    id: 'role-admin',
    name: 'ADMIN',
    description: 'Factory Owner. Full control over plant operations, orders, inventory, user accounts & role assignment.',
    isSystemRole: true,
    roleBadgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    allowedTabs: [
      'dashboard',
      'products',
      'components',
      'kanban',
      'orders',
      'matrix',
      'terminal',
      'qc',
      'users',
      'clients',
    ],
  },
  {
    id: 'role-manager',
    name: 'MANAGER',
    description: 'Production Manager. Full planning & shop floor execution visibility. Excludes system role modifications.',
    isSystemRole: true,
    roleBadgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    allowedTabs: [
      'dashboard',
      'products',
      'components',
      'kanban',
      'orders',
      'matrix',
      'terminal',
      'qc',
      'clients',
    ],
  },
  {
    id: 'role-polishing-mgr',
    name: 'Polishing Manager',
    description: 'Custom Operational Role: Focused on Stage 5 Surface Prep, component inventory, Kanban & terminal movement.',
    isSystemRole: false,
    roleBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    allowedTabs: [
      'components',
      'kanban',
      'matrix',
      'terminal',
      'qc',
    ],
  },
  {
    id: 'role-supervisor',
    name: 'SUPERVISOR',
    description: 'Shop Floor Line Supervisor. Update stage progress, log batch completions & flag bottlenecks.',
    isSystemRole: true,
    roleBadgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    allowedTabs: [
      'kanban',
      'matrix',
      'terminal',
      'qc',
    ],
  },
  {
    id: 'role-qc',
    name: 'QC',
    description: 'Quality Control Inspector. Inspect batches, log defects, view quality metrics & audit logs.',
    isSystemRole: true,
    roleBadgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    allowedTabs: [
      'qc',
      'terminal',
      'matrix',
      'kanban',
    ],
  },
];

export function getUserAllowedTabs(user: ErpUser | null, rolesList: RoleDefinition[] = INITIAL_ROLES): ErpTabId[] {
  if (!user) return ALL_ERP_TABS.map((t) => t.id);

  // Super Admin & Admin always get full complete access to all 10 ERP sections
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return ALL_ERP_TABS.map((t) => t.id);
  }

  // If user has custom explicit overrides
  if (user.customAllowedTabs && user.customAllowedTabs.length > 0) {
    return user.customAllowedTabs;
  }

  const safeRoles = (rolesList && rolesList.length > 0) ? rolesList : INITIAL_ROLES;

  // Find matching role in rolesList
  const matchedRole = safeRoles.find(
    (r) => r.name.toLowerCase() === user.role.toLowerCase() || r.id === user.role
  );

  if (matchedRole) {
    return matchedRole.allowedTabs;
  }

  // Fallback defaults if role is not in rolesList
  if (user.role === 'MANAGER') {
    return ['dashboard', 'products', 'components', 'kanban', 'orders', 'matrix', 'terminal', 'qc', 'clients'];
  }
  if (user.role === 'SUPERVISOR') {
    return ['kanban', 'matrix', 'terminal', 'qc'];
  }
  if (user.role === 'QC') {
    return ['qc', 'terminal', 'matrix', 'kanban'];
  }

  return ['dashboard', 'kanban', 'terminal'];
}

export function isTabAllowed(user: ErpUser | null, tab: ErpTabId, rolesList: RoleDefinition[] = INITIAL_ROLES): boolean {
  const allowed = getUserAllowedTabs(user, rolesList);
  return allowed.includes(tab);
}
