import React, { useState } from 'react';
import {
  ErpDataState,
  PurchaseOrder,
  PRODUCTION_STAGES
} from '../types/erp';
import {
  Layers,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  FileText,
  User,
  Calendar,
  DollarSign,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Maximize2,
  Minimize2,
  PackageCheck,
  X
} from 'lucide-react';

interface ProductionFlowManagerProps {
  state: ErpDataState;
  setSelectedPoIdForMatrix: (poId: string) => void;
  setActiveTab: (tab: any) => void;
  onOpenNewOrder: () => void;
  searchQuery: string;
}

export const ProductionFlowManager: React.FC<ProductionFlowManagerProps> = ({
  state,
  setSelectedPoIdForMatrix,
  setActiveTab,
  onOpenNewOrder,
  searchQuery,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [localSearchQuery, setLocalSearchQuery] = useState<string>('');
  // Accordion state to track which PO cards are expanded
  const [expandedPoIds, setExpandedPoIds] = useState<string[]>([]);

  const activeSearch = (localSearchQuery || searchQuery).toLowerCase().trim();

  const filteredPOs = state.purchaseOrders.filter((po) => {
    const matchesSearch =
      !activeSearch ||
      po.poNumber.toLowerCase().includes(activeSearch) ||
      po.clientName.toLowerCase().includes(activeSearch) ||
      po.clientEmail.toLowerCase().includes(activeSearch) ||
      po.targetDeliveryDate.toLowerCase().includes(activeSearch) ||
      po.items.some(
        (item) =>
          item.name.toLowerCase().includes(activeSearch) ||
          item.code.toLowerCase().includes(activeSearch)
      );
    const matchesStatus = statusFilter === 'ALL' || po.overallStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const togglePoExpand = (poId: string) => {
    setExpandedPoIds((prev) =>
      prev.includes(poId) ? prev.filter((id) => id !== poId) : [...prev, poId]
    );
  };

  const handleExpandAll = () => {
    setExpandedPoIds(filteredPOs.map((p) => p.id));
  };

  const handleCollapseAll = () => {
    setExpandedPoIds([]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Purchase Order Production Flow
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any purchase order row to expand details, order items, and 12-stage component pipeline state.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Purchase Order</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4 text-blue-600" />
        </div>
        <input
          type="text"
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          placeholder="Search PO Number (e.g. PO-2025-001), Client Name, Email, or Delivery Date..."
          className="w-full pl-10 pr-24 py-2.5 text-xs bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium text-slate-900 shadow-2xs"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {localSearchQuery && (
            <button
              onClick={() => setLocalSearchQuery('')}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 hidden sm:inline-block">
            {filteredPOs.length} {filteredPOs.length === 1 ? 'order' : 'orders'}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Accordion Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl p-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider pr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Status:</span>
          </span>
          {['ALL', 'Forecasting', 'In Production', 'Assembly Ready', 'Packing', 'Dispatched'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {status === 'ALL' ? 'All Orders' : status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
          <button
            onClick={handleExpandAll}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            title="Expand all purchase order details"
          >
            <Maximize2 className="w-3 h-3 text-slate-500" />
            <span>Expand All</span>
          </button>
          <button
            onClick={handleCollapseAll}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            title="Collapse all purchase order details"
          >
            <Minimize2 className="w-3 h-3 text-slate-500" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Purchase Orders List (Accordion FAQ Style) */}
      <div className="space-y-3">
        {filteredPOs.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200/90 rounded-2xl text-slate-400 text-xs shadow-xs">
            No purchase orders match your filter criteria.
          </div>
        ) : (
          filteredPOs.map((po) => {
            const isExpanded = expandedPoIds.includes(po.id);
            const totalParts = po.partWorkOrders.length;
            const readyParts = po.partWorkOrders.filter(
              (pwo) => pwo.status === 'Ready for Assembly' || pwo.currentStage >= 10
            ).length;

            const isBlocked = po.partWorkOrders.some(
              (pwo) => pwo.bottleneckAlert || pwo.status === 'QC Flagged'
            );

            // Calculate overall percentage
            const avgStage = po.partWorkOrders.reduce((sum, pwo) => sum + pwo.currentStage, 0) / (totalParts || 1);
            const progressPercent = Math.min(100, Math.round((avgStage / 12) * 100));

            return (
              <div
                key={po.id}
                className={`bg-white border rounded-2xl overflow-hidden transition-all shadow-xs ${
                  isExpanded ? 'border-blue-300 ring-2 ring-blue-500/10' : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Accordion Line Item Header Row - FAQ style click handler */}
                <div
                  onClick={() => togglePoExpand(po.id)}
                  className={`p-4 cursor-pointer select-none transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isExpanded ? 'bg-slate-50/80 border-b border-slate-200/80' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Expand/Collapse Toggle Icon */}
                    <div className={`p-2 rounded-xl transition-colors ${
                      isExpanded ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                          {po.poNumber}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm md:text-base truncate">{po.clientName}</h3>

                        {po.priority === 'Urgent' && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 rounded-full uppercase tracking-wider">
                            Urgent
                          </span>
                        )}

                        {po.priority === 'High Priority' && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 rounded-full uppercase tracking-wider">
                            High
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {po.clientEmail}
                        </span>
                        <span className="hidden sm:flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Target: <span className="text-slate-900 font-bold">{po.targetDeliveryDate}</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-600">
                          ${po.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Indicators & Action Buttons */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2.5 md:pt-0">
                    {/* Compact Assembly & Progress Pill */}
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Sub-Parts Ready</span>
                        <span className="font-mono text-xs font-bold text-slate-800">{readyParts}/{totalParts} Ready</span>
                      </div>

                      <div className="w-24 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600">
                          <span>Flow</span>
                          <span className="font-mono text-blue-600">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Badge & Action */}
                    <div className="flex items-center gap-2">
                      {isBlocked ? (
                        <span className="px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Delay Block
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-xl">
                          {po.overallStatus}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent accordion toggle when clicking matrix button
                          setSelectedPoIdForMatrix(po.id);
                          setActiveTab('matrix');
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Radio className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden sm:inline">Track Parts Matrix</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body Card (FAQ Dropdown style) */}
                {isExpanded && (
                  <div className="p-5 bg-white space-y-5 animate-fadeIn">
                    {/* Ordered Items Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                        <span className="text-slate-500 uppercase tracking-wider text-[10px] font-extrabold block">
                          Ordered Finished Goods / Components:
                        </span>
                        <ul className="space-y-1.5 font-medium text-slate-800">
                          {po.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                              <span className="flex items-center gap-1.5">
                                <PackageCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <span>{item.quantity}x <span className="font-bold text-blue-600">{item.name}</span> ({item.code})</span>
                              </span>
                              <span className="font-mono text-slate-600 font-bold">${(item.quantity * item.unitPrice).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-3">
                        <div>
                          <span className="text-slate-500 uppercase tracking-wider text-[10px] font-extrabold block mb-1">
                            Part-Level Assembly Readiness:
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-base font-bold text-slate-900 font-mono">
                              {readyParts} / {totalParts} <span className="text-xs text-slate-500 font-normal">Sub-Parts Ready for Assembly</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                            <span>Overall Production Flow:</span>
                            <span className="font-mono font-bold text-blue-600">{progressPercent}% Completed</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 12-Stage Visual Mini Stepper */}
                    <div className="pt-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                      <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                        <span>12-Stage Pipeline Milestone Progress:</span>
                        <span className="text-slate-400 font-mono">Stages 1 to 12</span>
                      </div>

                      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                        {PRODUCTION_STAGES.map((st) => {
                          const partsAtStage = po.partWorkOrders.filter(pwo => pwo.currentStage === st.id).length;
                          const partsPassedStage = po.partWorkOrders.filter(pwo => pwo.currentStage > st.id).length;

                          let colorClass = 'bg-white border-slate-200 text-slate-500';
                          if (partsPassedStage === totalParts && totalParts > 0) {
                            colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold';
                          } else if (partsAtStage > 0) {
                            colorClass = 'bg-amber-50 border-amber-300 text-amber-900 font-bold ring-1 ring-amber-300 shadow-2xs';
                          }

                          return (
                            <div
                              key={st.id}
                              title={`${st.id}. ${st.name} (${partsAtStage} parts active)`}
                              className={`p-1.5 rounded-xl text-[10px] text-center border flex flex-col justify-between h-14 ${colorClass}`}
                            >
                              <span className="font-mono text-[9px] opacity-70">#{st.id}</span>
                              <span className="line-clamp-2 leading-tight font-bold text-[9px]">
                                {st.shortName}
                              </span>
                              <span className="font-mono text-[9px] text-blue-600 font-extrabold mt-0.5">
                                {partsAtStage > 0 ? `${partsAtStage}p` : ''}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Matrix Link Footer Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 font-medium">
                        Need detailed part-by-stage work order tracking for this order?
                      </span>
                      <button
                        onClick={() => {
                          setSelectedPoIdForMatrix(po.id);
                          setActiveTab('matrix');
                        }}
                        className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200/80 cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        <Radio className="w-3.5 h-3.5 text-blue-600" />
                        <span>Open Matrix View for {po.poNumber}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
