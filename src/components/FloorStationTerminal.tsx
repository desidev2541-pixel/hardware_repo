import React, { useState } from 'react';
import {
  ErpDataState,
  PRODUCTION_STAGES,
  StageId,
  StageDefinition,
  PartWorkOrder,
  QcLog
} from '../types/erp';
import {
  Factory,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';

interface FloorStationTerminalProps {
  state: ErpDataState;
  setState: React.Dispatch<React.SetStateAction<ErpDataState>>;
}

export const FloorStationTerminal: React.FC<FloorStationTerminalProps> = ({
  state,
  setState,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<StageId>(5); // Default Polishing
  const [quickPassQty, setQuickPassQty] = useState<number>(50);

  const selectedStage = PRODUCTION_STAGES.find((s) => s.id === selectedStageId) || PRODUCTION_STAGES[4];

  // Collect all part work orders currently sitting at this station across ALL purchase orders
  const queuedParts: { poNumber: string; clientName: string; pwo: PartWorkOrder }[] = [];

  state.purchaseOrders.forEach((po) => {
    po.partWorkOrders.forEach((pwo) => {
      if (pwo.currentStage === selectedStageId) {
        queuedParts.push({ poNumber: po.poNumber, clientName: po.clientName, pwo });
      }
    });
  });

  // Handle Quick Stage Advancement
  const handleQuickAdvance = (poNumber: string, pwoId: string, qty: number) => {
    setState((prev) => {
      const updatedPOs = prev.purchaseOrders.map((po) => {
        if (po.poNumber !== poNumber) return po;

        const updatedPartOrders = po.partWorkOrders.map((pwo) => {
          if (pwo.id !== pwoId) return pwo;

          const nextStage = Math.min(12, pwo.currentStage + 1) as StageId;

          const updatedStageProgress = {
            ...pwo.stageProgress,
            [nextStage]: {
              stageId: nextStage,
              completedQty: qty,
              passedQC: qty,
              defectQty: 0,
              updatedAt: new Date().toISOString().split('T')[0],
            },
          };

          return {
            ...pwo,
            currentStage: nextStage,
            stageProgress: updatedStageProgress,
            status: nextStage >= 9 ? ('Ready for Assembly' as const) : ('In Progress' as const),
          };
        });

        return { ...po, partWorkOrders: updatedPartOrders };
      });

      return { ...prev, purchaseOrders: updatedPOs };
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Shop Floor Terminal Mode
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Designed for machine line operators & station heads to view queued parts & log stage completions.
            </p>
          </div>
        </div>

        {/* Station Select */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Select Station:</label>
          <select
            value={selectedStageId}
            onChange={(e) => setSelectedStageId(Number(e.target.value) as StageId)}
            className="bg-slate-50 border border-slate-200 text-blue-600 font-mono font-bold rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {PRODUCTION_STAGES.map((st) => (
              <option key={st.id} value={st.id}>
                Station {st.id}: {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ACTIVE STATION BANNER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              STATION #{selectedStage.id} OPERATOR VIEW
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedStage.name}</h3>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
            {queuedParts.length} Batches Currently Staged
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {selectedStage.description}
        </p>
      </div>

      {/* QUEUED PARTS FOR THIS STATION */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" />
            Active Batches Queued for Station #{selectedStage.id}
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {queuedParts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              No component batches are currently waiting at Station #{selectedStage.id}.
            </div>
          ) : (
            queuedParts.map(({ poNumber, clientName, pwo }) => (
              <div
                key={pwo.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {poNumber}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{pwo.partName}</h4>
                    <span className="font-mono text-xs text-slate-500 font-bold">({pwo.partCode})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Client: <span className="text-slate-800 font-semibold">{clientName}</span> | Required Batch: <span className="font-mono font-bold text-slate-900">{pwo.totalRequired} pcs</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    onClick={() => handleQuickAdvance(poNumber, pwo.id, pwo.totalRequired)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pass Batch to Stage #{selectedStage.id + 1}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
