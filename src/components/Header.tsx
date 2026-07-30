import React from 'react';
import {
  Factory,
  Package,
  Layers,
  Sparkles,
  Search,
  AlertTriangle,
  Radio,
  PlusCircle,
  BarChart3,
  ClipboardList,
  RotateCcw,
  Users,
  Kanban,
  Boxes,
  UserCheck,
  Building2,
  ArrowLeft,
  Bell,
  Puzzle,
  Laptop
} from 'lucide-react';
import { ErpUser, RoleDefinition, ErpTabId } from '../types/erp';
import { getUserAllowedTabs } from '../utils/rbac';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  activeBottlenecksCount: number;
  lowStockCount: number;
  activePoCount: number;
  onOpenNewOrder: () => void;
  onOpenAiAdvisor: () => void;
  onOpenNotifications?: () => void;
  notificationCount?: number;
  onResetData: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: ErpUser | null;
  rolesList?: RoleDefinition[];
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeBottlenecksCount,
  lowStockCount,
  activePoCount,
  onOpenNewOrder,
  onOpenAiAdvisor,
  onOpenNotifications,
  notificationCount = 0,
  onResetData,
  searchQuery,
  setSearchQuery,
  currentUser,
  rolesList,
  onOpenAuth,
}) => {
  const allowedTabs = getUserAllowedTabs(currentUser, rolesList);
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md border-b border-slate-800">
      {/* Top Header Bar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/30">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  ForgeTrack ERP
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 hidden sm:inline-block">
                  HARDWARE FACTORY
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden xl:block">
                Dual Inventory & 12-Stage Part-Level Production ERP
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search PO#, Client, Product, or Part Code (e.g. CMP-LVR-01)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-800/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Controls & Active User Switch */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Real-time Event Stream / Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 hover:text-amber-300 transition-all cursor-pointer shadow-xs"
              title="Open Real-time Factory Event Stream"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-4 text-[9px] font-black bg-rose-600 text-white rounded-full ring-2 ring-slate-900 flex items-center justify-center font-mono animate-pulse">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenAiAdvisor}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="hidden lg:inline">AI Operations Advisor</span>
            </button>

            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Purchase Order</span>
            </button>

            {/* Active User Chip */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer text-xs"
              title="Switch Active User Session"
            >
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-[10px]">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden xl:block">
                <p className="font-bold text-white leading-tight text-[11px]">{currentUser?.name}</p>
                <p className="text-[9px] text-blue-300 font-extrabold uppercase">{currentUser?.role}</p>
              </div>
            </button>

            <button
              onClick={onResetData}
              title="Reset to Demo Factory Data"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Tabs Bar */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-[1600px] mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-1.5 no-scrollbar">
          
          {allowedTabs.includes('dashboard') && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Factory Overview</span>
            </button>
          )}

          {allowedTabs.includes('products') && (
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Finished Goods</span>
            </button>
          )}

          {allowedTabs.includes('components') && (
            <button
              onClick={() => setActiveTab('components')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'components'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Puzzle className="w-4 h-4 text-purple-400" />
              <span>Components</span>
              {lowStockCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-rose-500 text-white">
                  {lowStockCount} Low
                </span>
              )}
            </button>
          )}

          {allowedTabs.includes('kanban') && (
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'kanban'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Kanban className="w-4 h-4 text-amber-400" />
              <span>12-Stage Kanban Board</span>
            </button>
          )}

          {allowedTabs.includes('orders') && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Purchase Orders</span>
              <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {activePoCount} Active
              </span>
            </button>
          )}

          {allowedTabs.includes('matrix') && (
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Part Tracking Matrix</span>
              {activeBottlenecksCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-rose-500 text-white animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {activeBottlenecksCount} Bottleneck
                </span>
              )}
            </button>
          )}

          {allowedTabs.includes('terminal') && (
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'terminal'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Factory className="w-4 h-4" />
              <span>Shop Floor Terminal</span>
            </button>
          )}

          {allowedTabs.includes('qc') && (
            <button
              onClick={() => setActiveTab('qc')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'qc'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>QC Defect Logs</span>
            </button>
          )}

          {allowedTabs.includes('clients') && (
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Clients Directory</span>
            </button>
          )}

          {allowedTabs.includes('users') && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Accounts</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
