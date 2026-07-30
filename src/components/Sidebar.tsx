import React from 'react';
import {
  LayoutDashboard,
  Package,
  Puzzle,
  FileText,
  Kanban,
  ClipboardList,
  Users,
  Building2,
  LogOut,
  Factory,
  Shield,
  Sparkles,
  RotateCcw,
  Radio
} from 'lucide-react';
import { ErpUser, ErpTabId, RoleDefinition } from '../types/erp';
import { getUserAllowedTabs } from '../utils/rbac';

export type TabType = 
  | 'dashboard'
  | 'products'
  | 'components'
  | 'orders'
  | 'kanban'
  | 'matrix'
  | 'terminal'
  | 'clients'
  | 'qc'
  | 'users';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  currentUser: ErpUser | null;
  rolesList?: RoleDefinition[];
  onLogout: () => void;
  activePoCount: number;
  lowStockCount: number;
  bottlenecksCount: number;
  clientCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  rolesList,
  onLogout,
  activePoCount,
  lowStockCount,
  bottlenecksCount,
}) => {
  const allowedTabs = getUserAllowedTabs(currentUser, rolesList);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Factory Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      badge: null,
    },
    {
      id: 'components',
      label: 'Components',
      icon: Puzzle,
      badge: lowStockCount > 0 ? `${lowStockCount} Alert` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'orders',
      label: 'Purchase Orders',
      icon: FileText,
      badge: activePoCount > 0 ? `${activePoCount} Active` : null,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'kanban',
      label: 'Production Board',
      icon: Kanban,
      badge: bottlenecksCount > 0 ? `${bottlenecksCount} Bottleneck` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'matrix',
      label: 'Part Matrix',
      icon: Radio,
      badge: null,
    },
    {
      id: 'terminal',
      label: 'Shop Floor Terminal',
      icon: Factory,
      badge: null,
    },
    {
      id: 'qc',
      label: 'QC Defect Logs',
      icon: ClipboardList,
      badge: null,
    },
    {
      id: 'clients',
      label: 'Clients Directory',
      icon: Building2,
      badge: null,
    },
    {
      id: 'users',
      label: 'Users & Roles',
      icon: Users,
      badge: null,
    },
  ];

  const filteredNavItems = navItems.filter((item) => allowedTabs.includes(item.id as ErpTabId));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col h-screen sticky top-0 z-40 select-none shadow-xl shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/40">
          <Factory className="w-5 h-5 font-bold" />
        </div>
        <div>
          <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            HANDLEWORKS
          </div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            FACTORY ERP
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          Operations Menu
        </p>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-1 ring-blue-400/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer User Profile Card */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        {currentUser ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold flex items-center justify-center text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate max-w-[110px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[110px]">
                    {currentUser.title}
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {currentUser.role}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-300 text-slate-300 border border-slate-700/60 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow cursor-pointer"
          >
            <span>Sign In to ERP</span>
          </button>
        )}
      </div>
    </aside>
  );
};
