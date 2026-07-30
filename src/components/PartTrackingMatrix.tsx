import React, { useState } from 'react';
import {
  ErpDataState,
  PartWorkOrder,
  PurchaseOrder,
  PRODUCTION_STAGES,
  StageId,
  QcLog
} from '../types/erp';
import {
  Radio,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Filter,
  Wrench,
  Printer,
  ChevronRight,
  Activity,
  Layers,
  X,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Check,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';

interface PartTrackingMatrixProps {
  state: ErpDataState;
  setState: React.Dispatch<React.SetStateAction<ErpDataState>>;
  selectedPoId: string;
  setSelectedPoId: (poId: string) => void;
  setActiveTab?: (tab: any) => void;
  onGoBack?: () => void;
}

export const PartTrackingMatrix: React.FC<PartTrackingMatrixProps> = ({
  state,
  setState,
  selectedPoId,
  setSelectedPoId,
  setActiveTab,
  onGoBack,
}) => {
  // Currently selected Purchase Order
  const po = state.purchaseOrders.find((p) => p.id === selectedPoId) || state.purchaseOrders[0];

  // Selected Part Work Order for Batch Advance Modal
  const [selectedPartOrder, setSelectedPartOrder] = useState<PartWorkOrder | null>(null);

  // Batch Advance Form State
  const [targetStageId, setTargetStageId] = useState<StageId>(2);
  const [batchCompletedQty, setBatchCompletedQty] = useState<number>(100);
  const [batchDefectQty, setBatchDefectQty] = useState<number>(0);
  const [defectReason, setDefectReason] = useState<string>('Minor surface scratch');
  const [inspectorName, setInspectorName] = useState<string>('Line Supervisor');

  // Job Traveler Print Modal
  const [isTravelerOpen, setIsTravelerOpen] = useState<boolean>(false);

  if (!po) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200/90 rounded-2xl text-slate-400 text-xs shadow-xs">
        No active purchase order selected.
      </div>
    );
  }

  // Calculate Assembly Readiness
  const partWorkOrders = po.partWorkOrders;
  const totalPartsCount = partWorkOrders.length;
  const readyForAssemblyCount = partWorkOrders.filter(
    (pwo) => pwo.status === 'Ready for Assembly' || pwo.currentStage >= 10
  ).length;

  const blockedParts = partWorkOrders.filter(
    (pwo) => pwo.bottleneckAlert || pwo.status === 'QC Flagged' || pwo.currentStage < 9
  );

  const isAssemblyReady = readyForAssemblyCount === totalPartsCount && totalPartsCount > 0;

  // Handler to Open Batch Move Modal
  const handleOpenBatchMove = (pwo: PartWorkOrder) => {
    setSelectedPartOrder(pwo);
    const nextStage = Math.min(12, pwo.currentStage + 1) as StageId;
    setTargetStageId(nextStage);
    setBatchCompletedQty(pwo.totalRequired);
    setBatchDefectQty(0);
  };

  // Submit Batch Advance
  const handleSubmitBatchMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartOrder) return;

    const passedCount = Math.max(0, batchCompletedQty - batchDefectQty);

    setState((prev) => {
      const updatedPOs = prev.purchaseOrders.map((p) => {
        if (p.id !== po.id) return p;

        const updatedPartOrders = p.partWorkOrders.map((pwo) => {
          if (pwo.id !== selectedPartOrder.id) return pwo;

          const updatedStageProgress = {
            ...pwo.stageProgress,
            [targetStageId]: {
              stageId: targetStageId,
              completedQty: batchCompletedQty,
              passedQC: passedCount,
              defectQty: batchDefectQty,
              defectNotes: batchDefectQty > 0 ? defectReason : undefined,
              updatedAt: new Date().toISOString().split('T')[0],
            },
          };

          let newStatus = pwo.status;
          if (batchDefectQty > 0) {
            newStatus = 'QC Flagged';
          } else if (targetStageId >= 9) {
            newStatus = 'Ready for Assembly';
          } else {
            newStatus = 'In Progress';
          }

          return {
            ...pwo,
            currentStage: targetStageId,
            stageProgress: updatedStageProgress,
            status: newStatus,
            bottleneckAlert: batchDefectQty > 0 ? `Defect flagged at Stage ${targetStageId}: ${defectReason}` : undefined,
          };
        });

        return {
          ...p,
          partWorkOrders: updatedPartOrders,
        };
      });

      // Log into QC logs if defect or inspection
      let newQcLogs = prev.qcLogs;
      if (batchDefectQty > 0 || PRODUCTION_STAGES.find((s) => s.id === targetStageId)?.isQcStage) {
        const newLog: QcLog = {
          id: `qc-${Date.now()}`,
          poNumber: po.poNumber,
          partCode: selectedPartOrder.partCode,
          partName: selectedPartOrder.partName,
          stageId: targetStageId,
          inspectorName: inspectorName,
          passedCount: passedCount,
          defectCount: batchDefectQty,
          defectReason: batchDefectQty > 0 ? defectReason : 'Passed inspection',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
        newQcLogs = [newLog, ...prev.qcLogs];
      }

      return {
        ...prev,
        purchaseOrders: updatedPOs,
        qcLogs: newQcLogs,
      };
    });

    setSelectedPartOrder(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Selector Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          {(onGoBack || setActiveTab) && (
            <button
              onClick={() => {
                if (onGoBack) onGoBack();
                else if (setActiveTab) setActiveTab('orders');
              }}
              className="p-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 font-bold text-xs shadow-2xs group"
              title="Return to Purchase Orders flow"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Back to POs</span>
            </button>
          )}

          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hidden sm:block">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Component-Level Part Tracking Radar
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed part-by-part manufacturing breakdown for every sub-component of ordered handle sets.
            </p>
          </div>
        </div>

        {/* Purchase Order Dropdown Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-slate-600 font-bold uppercase tracking-wider whitespace-nowrap">Select Order:</label>
          <select
            value={selectedPoId}
            onChange={(e) => setSelectedPoId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-blue-600 font-mono font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 cursor-pointer"
          >
            {state.purchaseOrders.map((p) => (
              <option key={p.id} value={p.id}>
                {p.poNumber} - {p.clientName}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsTravelerOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Job Route Card</span>
          </button>
        </div>
      </div>

      {/* ASSEMBLY LINE READINESS BANNER */}
      <div
        className={`p-5 rounded-2xl border shadow-xs transition-all ${
          isAssemblyReady
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isAssemblyReady
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isAssemblyReady ? <CheckCircle2 className="w-6 h-6" /> : <Wrench className="w-6 h-6 animate-pulse" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">
                  {isAssemblyReady
                    ? 'ASSEMBLY LINE READY: All Sub-Components 100% Prepared!'
                    : `ASSEMBLY LINE ON HOLD: (${readyForAssemblyCount} of ${totalPartsCount} Components Ready)`}
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-blue-600">
                  {po.poNumber}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-1">
                {isAssemblyReady
                  ? 'All levers, rose outer caps, sub-plates, spindles, springs & fasteners have completed Stage 9 Pre-Assembly QC and are staged at Assembly Bay.'
                  : `Assembly cannot begin until all sub-parts arrive at Stage 10 (Assembly). Currently ${blockedParts.length} sub-components are progressing in earlier machining or finishing stages.`}
              </p>
            </div>
          </div>

          <div className="text-right whitespace-nowrap self-end md:self-center">
            <span className="text-xs font-mono font-bold text-slate-900 block">
              Ordered Qty: {po.items.map((i) => `${i.quantity}x ${i.code}`).join(', ')}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Delivery Target: {po.targetDeliveryDate}</span>
          </div>
        </div>
      </div>

      {/* COMPONENT-LEVEL MATRIX TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Sub-Component Production Matrix (Part-by-Part Floor Status)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {partWorkOrders.length} Sub-Components Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Component & Code</th>
                <th className="py-3.5 px-4">Qty Required</th>
                <th className="py-3.5 px-4">Current Station (1-12)</th>
                <th className="py-3.5 px-4">12-Stage Pipeline Progress</th>
                <th className="py-3.5 px-4">QC Health</th>
                <th className="py-3.5 px-4 text-right">Shop Floor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {partWorkOrders.map((pwo) => {
                const component = state.components.find((c) => c.id === pwo.componentId);
                const currentStageDef = PRODUCTION_STAGES.find((s) => s.id === pwo.currentStage);
                const hasBottleneck = !!pwo.bottleneckAlert || pwo.status === 'QC Flagged';

                return (
                  <tr key={pwo.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Component Name & Code */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">
                        {pwo.partName}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] mt-1">
                        <span className="font-mono text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{pwo.partCode}</span>
                        {component && (
                          <span className="text-slate-500 font-medium">
                            • Material: <span className="text-slate-800 font-semibold">{component.material}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Required */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                      {pwo.totalRequired} pcs
                    </td>

                    {/* Current Stage */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-extrabold border border-slate-200 inline-block text-[11px]">
                        Stage {pwo.currentStage}: {currentStageDef?.shortName}
                      </span>
                    </td>

                    {/* 12-Stage Mini Dots Progress Bar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        {PRODUCTION_STAGES.map((st) => {
                          const isDone = st.id < pwo.currentStage;
                          const isCurrent = st.id === pwo.currentStage;
                          
                          let bg = 'bg-slate-200 border-slate-300';
                          if (isDone) bg = 'bg-emerald-500 border-emerald-600';
                          if (isCurrent) bg = 'bg-blue-600 border-blue-700 ring-2 ring-blue-300';

                          return (
                            <div
                              key={st.id}
                              title={`Stage ${st.id}: ${st.shortName}`}
                              className={`w-3 h-3 rounded-full border ${bg}`}
                            />
                          );
                        })}
                      </div>
                    </td>

                    {/* QC Health */}
                    <td className="py-3.5 px-4">
                      {hasBottleneck ? (
                        <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          QC Flagged
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Passed Stage QC
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenBatchMove(pwo)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Move Next Stage</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOVE BATCH STAGE ADVANCE MODAL */}
      {selectedPartOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                  {selectedPartOrder.partCode}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Advance Component Stage
                </h3>
              </div>
              <button
                onClick={() => setSelectedPartOrder(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitBatchMove} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Production Station</label>
                <select
                  value={targetStageId}
                  onChange={(e) => setTargetStageId(Number(e.target.value) as StageId)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {PRODUCTION_STAGES.map((st) => (
                    <option key={st.id} value={st.id}>
                      Stage {st.id}: {st.name} {st.isQcStage ? '(QC Station)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Batch Completed Quantity</label>
                <input
                  type="number"
                  required
                  value={batchCompletedQty}
                  onChange={(e) => setBatchCompletedQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Defective Units Flagged</label>
                <input
                  type="number"
                  required
                  value={batchDefectQty}
                  onChange={(e) => setBatchDefectQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {batchDefectQty > 0 && (
                <div>
                  <label className="block font-bold text-rose-700 mb-1">Defect Category / Reason</label>
                  <input
                    type="text"
                    required
                    value={defectReason}
                    onChange={(e) => setDefectReason(e.target.value)}
                    placeholder="e.g. Porosity pit after brass casting"
                    className="w-full px-3 py-2 border border-rose-300 rounded-xl bg-rose-50 text-rose-900 font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inspector / Supervisor Name</label>
                <input
                  type="text"
                  required
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPartOrder(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Confirm Stage Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOB TRAVELER PRINT ROUTE CARD MODAL */}
      {isTravelerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {po.poNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Shop Floor Job Route Card / Job Traveler
                </h3>
              </div>
              <button
                onClick={() => setIsTravelerOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">HANDLEWORKS FACTORY JOB ROUTE CARD</h4>
                  <p className="text-xs text-slate-500 font-medium">Client: {po.clientName} | Order Date: {po.orderDate}</p>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] font-bold text-center">
                  <QrCode className="w-8 h-8 mx-auto text-slate-900" />
                  <span>PO-ROUTE-SCAN</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 uppercase mb-2">Attached Component Batches:</p>
                <div className="space-y-1.5 text-xs font-medium">
                  {po.partWorkOrders.map((pwo) => (
                    <div key={pwo.id} className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900">{pwo.partName}</span>
                        <span className="font-mono text-blue-600 ml-2">({pwo.partCode})</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">
                        Batch Qty: {pwo.totalRequired} pcs
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Route Card</span>
              </button>
              <button
                onClick={() => setIsTravelerOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
