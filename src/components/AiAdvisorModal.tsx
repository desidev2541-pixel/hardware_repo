import React, { useState } from 'react';
import { ErpDataState } from '../types/erp';
import { Sparkles, Cpu, X, AlertTriangle, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';

interface AiAdvisorModalProps {
  state: ErpDataState;
  onClose: () => void;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({ state, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activePOs = state.purchaseOrders.filter((po) => po.overallStatus !== 'Dispatched');

  const erpSummary = {
    activePOsCount: activePOs.length,
    activeOrders: activePOs.map((p) => ({
      poNumber: p.poNumber,
      client: p.clientName,
      status: p.overallStatus,
      targetDate: p.targetDeliveryDate,
      partsCount: p.partWorkOrders.length,
      delayedParts: p.partWorkOrders
        .filter((pwo) => pwo.bottleneckAlert || pwo.status === 'QC Flagged')
        .map((pwo) => `${pwo.partName} (${pwo.partCode}) at Stage ${pwo.currentStage}`),
    })),
    lowStockRawComponents: state.components
      .filter((c) => c.stockQty <= c.reorderPoint)
      .map((c) => `${c.name} (${c.partCode}) - Stock: ${c.stockQty}/${c.reorderPoint}`),
    recentQcDefects: state.qcLogs
      .filter((l) => l.defectCount > 0)
      .map((l) => `${l.partName} in Stage ${l.stageId}: ${l.defectReason}`),
  };

  const handleRunAiAudit = async (customPrompt?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          erpSummary,
          query: customPrompt || query || 'Provide an executive shop floor bottleneck audit & top 3 action items.',
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate AI operational advice.');
      }

      setAiResponse(data.advice);
    } catch (err: any) {
      console.error('Error fetching AI advice:', err);
      setError(err.message || 'Error communicating with AI operations server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Operations & Bottleneck Advisor</h3>
              <p className="text-xs text-slate-400">Powered by Gemini 3.6 Flash Server Intelligence</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          
          {/* Preset Buttons */}
          <div>
            <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">
              1-Click AI Operational Audits:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleRunAiAudit('Analyze current shop floor assembly bottlenecks and missing sub-parts.')}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-slate-200 hover:text-amber-300 font-medium transition-all cursor-pointer flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Assembly Bottlenecks Audit</span>
              </button>

              <button
                onClick={() => handleRunAiAudit('Check raw component inventory stocks and advise urgent reorders.')}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-slate-200 hover:text-amber-300 font-medium transition-all cursor-pointer flex items-center gap-2"
              >
                <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Raw Parts Reorder Audit</span>
              </button>
            </div>
          </div>

          {/* Custom Query Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask AI anything (e.g. How to resolve Electroplating delays for PO-2026-088?)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              onClick={() => handleRunAiAudit()}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-lg hover:from-amber-400 hover:to-orange-400 shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Analyze</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* AI Response Output */}
          {loading && (
            <div className="p-8 text-center space-y-3 bg-slate-950 border border-slate-800 rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
              <p className="text-slate-300 font-medium">Analyzing 12-stage pipeline data & component dependencies...</p>
            </div>
          )}

          {aiResponse && !loading && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 leading-relaxed whitespace-pre-wrap font-sans text-xs space-y-2">
              <div className="font-bold text-amber-400 flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                AI Operations Intelligence Report
              </div>
              {aiResponse}
            </div>
          )}

        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 cursor-pointer text-xs"
          >
            Close AI Advisor
          </button>
        </div>

      </div>
    </div>
  );
};
