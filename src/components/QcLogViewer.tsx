import React from 'react';
import { ErpDataState, PRODUCTION_STAGES } from '../types/erp';
import { ShieldCheck, AlertTriangle, ClipboardList, CheckCircle2 } from 'lucide-react';

interface QcLogViewerProps {
  state: ErpDataState;
  searchQuery: string;
}

export const QcLogViewer: React.FC<QcLogViewerProps> = ({ state, searchQuery }) => {
  const filteredLogs = state.qcLogs.filter((log) => {
    return (
      log.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.partCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.inspectorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Quality Control Inspection Audit Trail
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical log of all Quality Checks (QC #1 In-Process, QC #2 Surface, QC #3 Plating & Final Pre-Assembly Inspections).
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
          {filteredLogs.length} Inspection Entries
        </span>
      </div>

      {/* QC Logs Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">PO & Component</th>
                <th className="py-3.5 px-4">QC Inspection Station</th>
                <th className="py-3.5 px-4">Passed Qty</th>
                <th className="py-3.5 px-4">Defect Qty & Reason</th>
                <th className="py-3.5 px-4">Inspector Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No QC inspection logs recorded yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const stage = PRODUCTION_STAGES.find((s) => s.id === log.stageId);
                  const hasDefect = log.defectCount > 0;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] font-medium">
                        {log.timestamp}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{log.partName}</div>
                        <div className="flex items-center gap-2 text-[11px] mt-0.5">
                          <span className="font-mono text-blue-600 font-bold">{log.poNumber}</span>
                          <span className="text-slate-400 font-mono">• {log.partCode}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                          Stage {log.stageId}: {stage?.shortName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 text-sm">
                        {log.passedCount}
                      </td>

                      <td className="py-3.5 px-4">
                        {hasDefect ? (
                          <div className="text-rose-700 font-bold flex items-center gap-1.5">
                            <span className="font-mono text-rose-600 text-sm">{log.defectCount}</span>
                            <span className="text-[11px]">({log.defectReason})</span>
                          </div>
                        ) : (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            0 Defects
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {log.inspectorName}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            </table>
          </div>
        </div>

    </div>
  );
};
