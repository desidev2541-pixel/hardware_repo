import React, { useState } from 'react';
import {
  ErpDataState,
  PRODUCTION_STAGES,
  StageId,
  PartWorkOrder,
  PurchaseOrder,
  InventoryComponent,
  QcLog
} from '../types/erp';
import {
  Kanban,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  Building2,
  Ruler,
  Boxes,
  Info,
  User,
  X,
  ClipboardCheck,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface KanbanBoardProps {
  state: ErpDataState;
  setState: React.Dispatch<React.SetStateAction<ErpDataState>>;
  searchQuery?: string;
}

interface MoveStageModalInfo {
  pwoId: string;
  poNumber: string;
  partCode: string;
  partName: string;
  totalRequired: number;
  currentStage: StageId;
  targetStage: StageId;
  direction: 'next' | 'prev';
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  state,
  setState,
  searchQuery = '',
}) => {
  const [selectedPoFilter, setSelectedPoFilter] = useState<string>('ALL');
  const [selectedStageFilter, setSelectedStageFilter] = useState<number | 'ALL'>('ALL');
  const [partModal, setPartModal] = useState<PartWorkOrder | null>(null);

  // Stage transition modal state
  const [moveModal, setMoveModal] = useState<MoveStageModalInfo | null>(null);
  const [operatorName, setOperatorName] = useState<string>('');
  const [goodQty, setGoodQty] = useState<number>(0);
  const [badQty, setBadQty] = useState<number>(0);
  const [defectReason, setDefectReason] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Extract all PartWorkOrders across purchase orders
  const allPos = state.purchaseOrders;
  const filteredPos = selectedPoFilter === 'ALL' 
    ? allPos 
    : allPos.filter((p) => p.id === selectedPoFilter);

  const allWorkOrders = filteredPos.flatMap((po) => 
    po.partWorkOrders.map((pwo) => ({ ...pwo, poNumber: po.poNumber, clientName: po.clientName }))
  );

  // Filter search
  const searchedWorkOrders = allWorkOrders.filter((wo) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      wo.partName.toLowerCase().includes(q) ||
      wo.partCode.toLowerCase().includes(q) ||
      wo.poNumber.toLowerCase().includes(q) ||
      wo.clientName.toLowerCase().includes(q)
    );
  });

  // Trigger stage transition modal
  const initiateStageMove = (
    wo: { id: string; poNumber: string; partCode: string; partName: string; totalRequired: number; currentStage: StageId },
    direction: 'next' | 'prev'
  ) => {
    const currentStage = wo.currentStage;
    const targetStage = direction === 'next' 
      ? (Math.min(12, currentStage + 1) as StageId)
      : (Math.max(1, currentStage - 1) as StageId);

    if (targetStage === currentStage) return;

    setMoveModal({
      pwoId: wo.id,
      poNumber: wo.poNumber,
      partCode: wo.partCode,
      partName: wo.partName,
      totalRequired: wo.totalRequired,
      currentStage,
      targetStage,
      direction,
    });
    setOperatorName('Rajesh Sharma (Supervisor)');
    setGoodQty(wo.totalRequired);
    setBadQty(0);
    setDefectReason('');
    setFormError('');
  };

  // Confirm stage transition & log quality
  const confirmStageMove = (
    pwoId: string,
    targetStage: StageId,
    opName: string,
    goodCount: number,
    badCount: number,
    reason: string
  ) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toISOString().replace('T', ' ').slice(0, 16);

    setState((prev) => {
      let targetPoNumber = '';
      let targetPartCode = '';
      let targetPartName = '';

      const updatedPos = prev.purchaseOrders.map((po) => {
        const hasWorkOrder = po.partWorkOrders.some((w) => w.id === pwoId);
        if (!hasWorkOrder) return po;

        const updatedWorkOrders = po.partWorkOrders.map((w) => {
          if (w.id !== pwoId) return w;

          targetPoNumber = po.poNumber;
          targetPartCode = w.partCode;
          targetPartName = w.partName;

          const updatedStageProgress = { ...w.stageProgress };
          updatedStageProgress[targetStage] = {
            stageId: targetStage,
            completedQty: goodCount + badCount,
            passedQC: goodCount,
            defectQty: badCount,
            defectNotes: reason || (badCount > 0 ? 'Defective parts flagged during stage move' : 'Stage completed cleanly'),
            updatedAt: dateStr,
          };

          const isCompleted = targetStage === 12;
          const status = isCompleted
            ? 'Completed'
            : badCount > 0
            ? 'QC Flagged'
            : targetStage >= 10
            ? 'Ready for Assembly'
            : 'In Progress';

          const bottleneckAlert = badCount > 0
            ? `${badCount} defective unit(s) reported at Stage ${targetStage} by ${opName}`
            : undefined;

          return {
            ...w,
            currentStage: targetStage,
            status,
            bottleneckAlert,
            stageProgress: updatedStageProgress,
          };
        });

        return { ...po, partWorkOrders: updatedWorkOrders };
      });

      // Create a new QC log entry for system auditing
      const newQcLog: QcLog = {
        id: `qc-${Date.now()}`,
        poNumber: targetPoNumber,
        partCode: targetPartCode,
        partName: targetPartName,
        stageId: targetStage,
        inspectorName: opName,
        passedCount: goodCount,
        defectCount: badCount,
        defectReason: reason || (badCount > 0 ? 'Defects flagged during stage move' : 'Clean stage move'),
        timestamp: timeStr,
      };

      return {
        ...prev,
        purchaseOrders: updatedPos,
        qcLogs: [newQcLog, ...prev.qcLogs],
      };
    });

    setMoveModal(null);
  };

  const handleConfirmMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveModal) return;

    if (!operatorName.trim()) {
      setFormError('Please enter the name of the operator/person moving this part.');
      return;
    }

    if (goodQty < 0 || badQty < 0) {
      setFormError('Quantities cannot be negative.');
      return;
    }

    if (goodQty === 0 && badQty === 0) {
      setFormError('Please enter at least 1 unit in good or bad quantity.');
      return;
    }

    if (badQty > 0 && !defectReason.trim()) {
      setFormError('Please provide a brief reason or note for the defective parts.');
      return;
    }

    confirmStageMove(
      moveModal.pwoId,
      moveModal.targetStage,
      operatorName.trim(),
      Number(goodQty),
      Number(badQty),
      defectReason.trim()
    );
  };

  // Helper to get component metadata
  const getComponentInfo = (componentId: string): InventoryComponent | undefined => {
    return state.components.find((c) => c.id === componentId);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                12-Stage Visual Production Board (Kanban)
              </h2>
              <p className="text-xs text-slate-500">
                Track each Purchase Order's parts through the 12 manufacturing stages. Drag or click to shift parts.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">PO:</span>
            <select
              value={selectedPoFilter}
              onChange={(e) => setSelectedPoFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Active POs ({state.purchaseOrders.length})</option>
              {state.purchaseOrders.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.poNumber} ({po.clientName.substring(0, 15)}...)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-slate-500 font-medium">Stage:</span>
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All 12 Stages</option>
              {PRODUCTION_STAGES.map((st) => (
                <option key={st.id} value={st.id}>
                  Stage {st.id}: {st.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stage Swimlanes / Kanban Board Horizontal Scroll */}
      <div className="overflow-x-auto pb-4 pt-1 no-scrollbar">
        <div className="flex gap-4 min-w-[3200px]">
          {PRODUCTION_STAGES.filter((st) => selectedStageFilter === 'ALL' || selectedStageFilter === st.id).map((stage) => {
            const partsInStage = searchedWorkOrders.filter((wo) => wo.currentStage === stage.id);

            return (
              <div
                key={stage.id}
                className="w-72 bg-slate-100/80 rounded-xl border border-slate-200 p-3.5 flex flex-col h-[750px] shrink-0"
              >
                {/* Stage Header */}
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                        {stage.id}
                      </span>
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide truncate max-w-[150px]">
                        {stage.shortName}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white text-slate-700 font-extrabold text-xs border border-slate-200 shadow-xs">
                      {partsInStage.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span className="truncate">{stage.department}</span>
                    {stage.isQcStage && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                        QC Check
                      </span>
                    )}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1 no-scrollbar">
                  {partsInStage.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs text-center p-3">
                      No parts currently in {stage.shortName}
                    </div>
                  ) : (
                    partsInStage.map((wo) => {
                      const comp = getComponentInfo(wo.componentId);

                      return (
                        <div
                          key={wo.id}
                          className={`bg-white rounded-xl border p-3.5 shadow-sm hover:shadow-md transition-all space-y-2.5 ${
                            wo.bottleneckAlert || wo.status === 'QC Flagged'
                              ? 'border-rose-300 ring-2 ring-rose-500/20 bg-rose-50/20'
                              : 'border-slate-200'
                          }`}
                        >
                          {/* Top PO Badge */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {wo.poNumber}
                            </span>
                            <span className="text-slate-500 font-medium truncate max-w-[100px]">
                              {wo.clientName}
                            </span>
                          </div>

                          {/* Part Details */}
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs tracking-tight">
                                {wo.partName}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                              Code: {wo.partCode}
                            </p>
                          </div>

                          {/* Material, Finish, Dimensions metadata */}
                          {comp && (
                            <div className="bg-slate-50 rounded-lg p-2 text-[10px] space-y-1 text-slate-600 border border-slate-100">
                              <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Material:</span>
                                <span className="font-bold text-slate-800">{comp.material}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Finish:</span>
                                <span className="font-bold text-slate-800">{comp.defaultFinish}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Dimensions:</span>
                                <span className="font-medium text-slate-700">{comp.dimensions}</span>
                              </div>
                            </div>
                          )}

                          {/* Quantity & Bottleneck Warning */}
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                                Batch Qty
                              </span>
                              <span className="font-bold text-slate-900 text-sm">
                                {wo.totalRequired} <span className="text-[10px] text-slate-500 font-normal">units</span>
                              </span>
                            </div>

                            {wo.bottleneckAlert && (
                              <span className="p-1.5 rounded-lg bg-rose-100 text-rose-600 border border-rose-200" title={wo.bottleneckAlert}>
                                <AlertTriangle className="w-4 h-4 animate-pulse" />
                              </span>
                            )}
                          </div>

                          {/* Stage Transition Controls */}
                          <div className="pt-2 flex items-center justify-between gap-1 border-t border-slate-100">
                            <button
                              disabled={wo.currentStage === 1}
                              onClick={() => initiateStageMove(wo, 'prev')}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 text-xs font-semibold cursor-pointer"
                              title="Move Back 1 Stage"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setPartModal(wo)}
                              className="px-2 py-1 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 cursor-pointer"
                            >
                              Details
                            </button>

                            <button
                              disabled={wo.currentStage === 12}
                              onClick={() => initiateStageMove(wo, 'next')}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[11px] font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <span>Next Stage</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Transition & Quality Inspection Modal */}
      {moveModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">Stage Transition & Quality Log</h3>
                  <p className="text-xs text-slate-300">
                    Specify operator name, good units, and defective units
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMoveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmMove} className="p-5 space-y-4 text-xs">
              {/* Stage Transition Summary Header */}
              <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                    {moveModal.poNumber}
                  </span>
                  <span className="font-bold text-slate-800">{moveModal.partName} ({moveModal.partCode})</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-blue-100 text-slate-700">
                  <div className="flex-1 bg-white p-2 rounded-lg border border-blue-200 text-center">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">From Stage #{moveModal.currentStage}</span>
                    <span className="font-bold text-slate-900">{PRODUCTION_STAGES.find(s => s.id === moveModal.currentStage)?.shortName}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 bg-blue-600 text-white p-2 rounded-lg text-center shadow-xs">
                    <span className="text-[10px] text-blue-100 font-bold block uppercase">To Stage #{moveModal.targetStage}</span>
                    <span className="font-bold">{PRODUCTION_STAGES.find(s => s.id === moveModal.targetStage)?.shortName}</span>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Inputs */}
              <div className="space-y-3">
                {/* Operator Name */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Operator / Supervisor Name <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => {
                      setOperatorName(e.target.value);
                      setFormError('');
                    }}
                    placeholder="e.g. Rajesh Sharma (Shop Floor Supervisor)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900"
                  />
                </div>

                {/* Good vs Bad Product Quantities */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Good Quantity */}
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/80 space-y-1">
                    <label className="block font-bold text-emerald-900 flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Good Product Qty <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={goodQty}
                      onChange={(e) => {
                        setGoodQty(Math.max(0, parseInt(e.target.value) || 0));
                        setFormError('');
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <span className="text-[10px] text-emerald-700 font-medium block">Passed inspection</span>
                  </div>

                  {/* Bad / Defective Quantity */}
                  <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200/80 space-y-1">
                    <label className="block font-bold text-rose-900 flex items-center gap-1">
                      <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                      <span>Bad / Defective Qty</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={badQty}
                      onChange={(e) => {
                        setBadQty(Math.max(0, parseInt(e.target.value) || 0));
                        setFormError('');
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-rose-300 rounded-lg font-bold text-rose-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                    <span className="text-[10px] text-rose-700 font-medium block">Rejected / Defects</span>
                  </div>
                </div>

                {/* Defect Reason / Notes */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Inspection Notes / Defect Reason {badQty > 0 && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={defectReason}
                    onChange={(e) => setDefectReason(e.target.value)}
                    placeholder={badQty > 0 ? "e.g. Surface scratches, dimensional tolerance issue" : "e.g. Batch cleared quality checks cleanly"}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900"
                  />
                </div>

                {/* Batch Summary Footer */}
                <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between text-slate-600 font-medium text-[11px]">
                  <span>Batch Required: <strong className="text-slate-900">{moveModal.totalRequired} units</strong></span>
                  <span>Logging Total: <strong className={goodQty + badQty !== moveModal.totalRequired ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>{goodQty + badQty} units</strong></span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMoveModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Move & Log Quality</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Part Work Order Details Modal */}
      {partModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {partModal.poNumber}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {partModal.partName}
                </h3>
              </div>
              <button
                onClick={() => setPartModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-medium">Part Code:</span>
                <p className="font-bold text-slate-800 font-mono">{partModal.partCode}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Batch Required:</span>
                <p className="font-bold text-slate-800">{partModal.totalRequired} units</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Current Stage:</span>
                <p className="font-bold text-blue-600">
                  Stage {partModal.currentStage}: {PRODUCTION_STAGES.find(s => s.id === partModal.currentStage)?.name}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Status:</span>
                <p className="font-bold text-slate-800">{partModal.status}</p>
              </div>
            </div>

            {/* Stage Progress Roadmap */}
            <div>
              <h4 className="font-bold text-xs text-slate-900 mb-2 uppercase tracking-wide">
                12-Stage Manufacturing Timeline
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRODUCTION_STAGES.map((st) => {
                  const isPast = st.id < partModal.currentStage;
                  const isCurrent = st.id === partModal.currentStage;
                  return (
                    <div
                      key={st.id}
                      className={`p-2 rounded-lg text-[10px] border flex items-center gap-2 ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : isPast
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold bg-black/20">
                        {st.id}
                      </span>
                      <span className="truncate">{st.shortName}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPartModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
