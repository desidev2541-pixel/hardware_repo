import React, { useState, useMemo } from 'react';
import {
  ErpDataState,
  StageId,
  PRODUCTION_STAGES
} from '../types/erp';
import {
  Bell,
  X,
  AlertTriangle,
  AlertOctagon,
  PackageCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  Filter,
  ShieldAlert,
  Boxes,
  ClipboardList,
  ExternalLink,
  PlusCircle,
  Sparkles,
  Check,
  RotateCcw,
  Zap,
  Building2
} from 'lucide-react';

export interface FactoryNotification {
  id: string;
  type: 'LOW_STOCK' | 'QC_FAILURE' | 'NEW_ORDER' | 'BOTTLENECK';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  poId?: string;
  partCode?: string;
  targetTab?: 'inventory' | 'components' | 'products' | 'orders' | 'matrix' | 'kanban' | 'qc' | 'clients';
  actionLabel?: string;
  badgeText?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  state: ErpDataState;
  setState: React.Dispatch<React.SetStateAction<ErpDataState>>;
  setActiveTab: (tab: any) => void;
  setSelectedPoIdForMatrix: (poId: string) => void;
  onOpenNewOrder?: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  state,
  setState,
  setActiveTab,
  setSelectedPoIdForMatrix,
  onOpenNewOrder,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LOW_STOCK' | 'QC_FAILURE' | 'NEW_ORDER' | 'BOTTLENECK'>('ALL');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [simulatedNotifications, setSimulatedNotifications] = useState<FactoryNotification[]>([]);

  // Dynamically compute factory alerts from current state
  const derivedNotifications = useMemo<FactoryNotification[]>(() => {
    const list: FactoryNotification[] = [];

    // 1. Low Stock Alerts (Components & Products)
    state.components.forEach((comp) => {
      if (comp.stockQty <= comp.reorderPoint) {
        list.push({
          id: `low-stock-comp-${comp.id}`,
          type: 'LOW_STOCK',
          severity: comp.stockQty === 0 ? 'CRITICAL' : 'WARNING',
          title: `Low Component Stock: ${comp.partCode}`,
          message: `${comp.name} is down to ${comp.stockQty} units (Reorder point: ${comp.reorderPoint}). Supplier: ${comp.supplier}`,
          timestamp: '10 mins ago',
          isRead: false,
          partCode: comp.partCode,
          targetTab: 'components',
          actionLabel: 'Inspect Component Stock',
          badgeText: `${comp.stockQty} UNITS LEFT`
        });
      }
    });

    state.products.forEach((prod) => {
      if (prod.stockQty <= prod.reorderPoint) {
        list.push({
          id: `low-stock-prod-${prod.id}`,
          type: 'LOW_STOCK',
          severity: prod.stockQty === 0 ? 'CRITICAL' : 'WARNING',
          title: `Low Finished Product Stock: ${prod.sku}`,
          message: `${prod.name} has only ${prod.stockQty} sets in warehouse (Reorder threshold: ${prod.reorderPoint}).`,
          timestamp: '25 mins ago',
          isRead: false,
          targetTab: 'products',
          actionLabel: 'View Product Catalog',
          badgeText: `${prod.stockQty} SETS`
        });
      }
    });

    // 2. Quality Check Failures
    state.qcLogs.forEach((qc) => {
      if (qc.defectCount > 0) {
        const stage = PRODUCTION_STAGES.find((s) => s.id === qc.stageId);
        list.push({
          id: `qc-fail-${qc.id}`,
          type: 'QC_FAILURE',
          severity: 'CRITICAL',
          title: `QC Defect Flagged: ${qc.partCode}`,
          message: `${qc.defectCount} defect(s) reported at Stage ${qc.stageId} (${stage?.name || 'QC'}) - ${qc.defectReason}. Inspector: ${qc.inspectorName}`,
          timestamp: qc.timestamp || 'Today 09:15 AM',
          isRead: false,
          partCode: qc.partCode,
          targetTab: 'qc',
          actionLabel: 'Open Defect Logs',
          badgeText: `${qc.defectCount} DEFECTS`
        });
      }
    });

    // 3. New / Urgent Purchase Orders
    state.purchaseOrders.forEach((po) => {
      if (po.priority === 'Urgent' || po.priority === 'High Priority') {
        list.push({
          id: `new-po-${po.id}`,
          type: 'NEW_ORDER',
          severity: 'INFO',
          title: `${po.priority.toUpperCase()}: ${po.poNumber}`,
          message: `Client ${po.clientName} requires ${po.items.length} item line(s) delivered by ${po.targetDeliveryDate}. Total Value: $${po.totalAmount.toLocaleString()}.`,
          timestamp: po.orderDate || 'Recent',
          isRead: false,
          poId: po.id,
          targetTab: 'matrix',
          actionLabel: 'Track PO Matrix',
          badgeText: po.priority
        });
      }
    });

    // 4. Bottleneck Alerts from Work Orders
    const activePOs = state.purchaseOrders.filter((p) => p.overallStatus !== 'Dispatched');
    activePOs.forEach((po) => {
      po.partWorkOrders.forEach((wo) => {
        if (wo.bottleneckAlert || wo.status === 'QC Flagged') {
          list.push({
            id: `bottleneck-${wo.id}`,
            type: 'BOTTLENECK',
            severity: wo.status === 'QC Flagged' ? 'CRITICAL' : 'WARNING',
            title: `Production Bottleneck: ${wo.partCode}`,
            message: wo.bottleneckAlert || `Work Order for ${wo.partName} flagged in Stage ${wo.currentStage}.`,
            timestamp: 'In Progress',
            isRead: false,
            poId: po.id,
            partCode: wo.partCode,
            targetTab: 'matrix',
            actionLabel: 'Track Part Matrix',
            badgeText: `STAGE ${wo.currentStage}`
          });
        }
      });
    });

    return list;
  }, [state]);

  // Combine simulated + derived, filtering out dismissed
  const allNotifications = useMemo(() => {
    const combined = [...simulatedNotifications, ...derivedNotifications];
    return combined
      .filter((item) => !dismissedIds.has(item.id))
      .map((item) => ({
        ...item,
        isRead: item.isRead || readIds.has(item.id)
      }));
  }, [derivedNotifications, simulatedNotifications, dismissedIds, readIds]);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'ALL') return allNotifications;
    return allNotifications.filter((n) => n.type === activeFilter);
  }, [allNotifications, activeFilter]);

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    const allIds = new Set([...readIds, ...allNotifications.map((n) => n.id)]);
    setReadIds(allIds);
  };

  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDismiss = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const handleExecuteAction = (notif: FactoryNotification) => {
    // Mark read
    setReadIds((prev) => new Set(prev).add(notif.id));
    
    if (notif.poId) {
      setSelectedPoIdForMatrix(notif.poId);
    }
    if (notif.targetTab) {
      setActiveTab(notif.targetTab);
    }
    onClose();
  };

  // Simulate a live factory event for test demonstration
  const handleSimulateEvent = () => {
    const eventTypes: FactoryNotification['type'][] = ['LOW_STOCK', 'QC_FAILURE', 'NEW_ORDER', 'BOTTLENECK'];
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let newEvent: FactoryNotification;

    if (randomType === 'LOW_STOCK') {
      newEvent = {
        id: `sim-lowstock-${Date.now()}`,
        type: 'LOW_STOCK',
        severity: 'CRITICAL',
        title: '⚡ Live Stock Alert: Brass Cast Ingot B-88',
        message: 'Raw melt material dipped below 120 kg. Immediate reorder needed for Polishing & Plating bays.',
        timestamp: timeNow,
        isRead: false,
        targetTab: 'components',
        actionLabel: 'Check Components',
        badgeText: 'CRITICAL LOW'
      };
    } else if (randomType === 'QC_FAILURE') {
      newEvent = {
        id: `sim-qcfail-${Date.now()}`,
        type: 'QC_FAILURE',
        severity: 'CRITICAL',
        title: '🚨 Live Defect Alert: Stage 8 Plating Salt-Spray',
        message: 'Micro-pitting detected on 48 units of Rose Gold PVD Mortise Locks. Line paused.',
        timestamp: timeNow,
        isRead: false,
        targetTab: 'qc',
        actionLabel: 'View Defect Log',
        badgeText: 'PLATING DEFECT'
      };
    } else if (randomType === 'NEW_ORDER') {
      newEvent = {
        id: `sim-po-${Date.now()}`,
        type: 'NEW_ORDER',
        severity: 'INFO',
        title: '📦 Live Order: PO-2026-902 Assigned',
        message: 'Grand Hyatt Dubai submitted urgent PO for 350 Satin Brass Lever Handle Sets.',
        timestamp: timeNow,
        isRead: false,
        targetTab: 'matrix',
        actionLabel: 'Open PO Matrix',
        badgeText: 'URGENT VIP'
      };
    } else {
      newEvent = {
        id: `sim-bottle-${Date.now()}`,
        type: 'BOTTLENECK',
        severity: 'WARNING',
        title: '⏱️ Bottleneck Flag: CNC Machining Queue',
        message: 'High queue depth at Stage 3 Operation Bay. 420 parts waiting over 3 hours.',
        timestamp: timeNow,
        isRead: false,
        targetTab: 'kanban',
        actionLabel: 'Open Kanban Board',
        badgeText: 'STAGE 3 DELAY'
      };
    }

    setSimulatedNotifications((prev) => [newEvent, ...prev]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200/90 flex flex-col h-full transform transition-transform ease-in-out duration-300">
          
          {/* Panel Header */}
          <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative p-2 bg-blue-600/30 border border-blue-500/40 rounded-xl text-blue-400">
                  <Bell className="w-5 h-5 animate-bounce" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-ping" />
                  )}
                </div>
                <div>
                  <h2 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                    <span>Factory Event Stream</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-mono font-bold">
                        {unreadCount} NEW
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real-time operational alerts & Quality control feed
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
              <button
                onClick={handleSimulateEvent}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg font-bold transition-all cursor-pointer text-[11px]"
                title="Simulate incoming real-time factory signal"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Simulate Event</span>
              </button>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-blue-400 hover:text-blue-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-slate-50 border-b border-slate-200/80 p-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({allNotifications.length})
            </button>

            <button
              onClick={() => setActiveFilter('LOW_STOCK')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeFilter === 'LOW_STOCK'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-rose-500" />
              <span>Low Stock</span>
            </button>

            <button
              onClick={() => setActiveFilter('QC_FAILURE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeFilter === 'QC_FAILURE'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>QC Failures</span>
            </button>

            <button
              onClick={() => setActiveFilter('NEW_ORDER')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeFilter === 'NEW_ORDER'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>New Orders</span>
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-700 text-sm">All clear on the factory floor!</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    No active critical alerts found in this filter category.
                  </p>
                </div>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isRead = notif.isRead;
                return (
                  <div
                    key={notif.id}
                    className={`rounded-2xl border transition-all p-4 relative group ${
                      isRead
                        ? 'bg-slate-50/60 border-slate-200/80 opacity-80'
                        : notif.severity === 'CRITICAL'
                        ? 'bg-rose-50/40 border-rose-200 ring-1 ring-rose-300/40 shadow-xs'
                        : notif.severity === 'WARNING'
                        ? 'bg-amber-50/40 border-amber-200 ring-1 ring-amber-300/30 shadow-xs'
                        : 'bg-blue-50/30 border-blue-200 shadow-2xs'
                    }`}
                  >
                    {/* Event Header line */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {/* Type Icon */}
                        {notif.type === 'LOW_STOCK' && (
                          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                            <Boxes className="w-4 h-4" />
                          </div>
                        )}
                        {notif.type === 'QC_FAILURE' && (
                          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                        )}
                        {notif.type === 'NEW_ORDER' && (
                          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                            <PackageCheck className="w-4 h-4" />
                          </div>
                        )}
                        {notif.type === 'BOTTLENECK' && (
                          <div className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
                            <Clock className="w-4 h-4" />
                          </div>
                        )}

                        <div>
                          <span className="font-bold text-slate-900 text-xs block leading-tight">
                            {notif.title}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{notif.timestamp}</span>
                          </span>
                        </div>
                      </div>

                      {/* Badge / Dismiss */}
                      <div className="flex items-center gap-1 shrink-0">
                        {notif.badgeText && (
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              notif.severity === 'CRITICAL'
                                ? 'bg-rose-600 text-white'
                                : notif.severity === 'WARNING'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {notif.badgeText}
                          </span>
                        )}

                        <button
                          onClick={(e) => handleDismiss(notif.id, e)}
                          className="text-slate-300 hover:text-slate-600 p-1 rounded-md transition-colors"
                          title="Dismiss alert"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Message Body */}
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">
                      {notif.message}
                    </p>

                    {/* Actionable Button Footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => handleToggleRead(notif.id, e)}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1"
                      >
                        <Check className={`w-3 h-3 ${isRead ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span>{isRead ? 'Read' : 'Mark as read'}</span>
                      </button>

                      {notif.actionLabel && (
                        <button
                          onClick={() => handleExecuteAction(notif)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer group"
                        >
                          <span>{notif.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Panel Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs flex items-center justify-between text-slate-500">
            <span className="font-mono text-[11px]">ForgeTrack Event Engine v2.4</span>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close Drawer
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
