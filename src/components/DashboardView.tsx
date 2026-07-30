import React, { useState } from 'react';
import {
  ErpDataState,
  PRODUCTION_STAGES,
  StageId
} from '../types/erp';
import {
  Layers,
  Package,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  Plus,
  ShieldCheck,
  Cpu,
  Boxes,
  Puzzle,
  FileCheck,
  ArrowUpRight,
  Zap,
  Clock,
  Gauge
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';

interface DashboardViewProps {
  state: ErpDataState;
  setActiveTab: (tab: any) => void;
  onOpenNewOrder: () => void;
  onOpenAiAdvisor: () => void;
  setSelectedPoIdForMatrix: (poId: string) => void;
}

// Helper component for rendering mini inline sparklines
const InlineSparkline: React.FC<{
  data: { day: string; value: number }[];
  color: string;
  gradientId: string;
  height?: number;
}> = ({ data, color, gradientId, height = 48 }) => {
  return (
    <div className="w-full h-12">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold shadow-md border border-slate-800">
                    <span className="text-slate-300">{payload[0].payload.day}: </span>
                    <span className="text-white font-mono">{payload[0].value}</span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  setActiveTab,
  onOpenNewOrder,
  onOpenAiAdvisor,
  setSelectedPoIdForMatrix,
}) => {
  // Calculations
  const activePOs = state.purchaseOrders.filter((po) => po.overallStatus !== 'Dispatched');
  const completedPOs = state.purchaseOrders.filter((po) => po.overallStatus === 'Dispatched');
  const totalPOValue = activePOs.reduce((acc, po) => acc + po.totalAmount, 0);

  const lowStockComponents = state.components.filter((c) => c.stockQty <= c.reorderPoint);
  const lowStockProducts = state.products.filter((p) => p.stockQty <= p.reorderPoint);
  const totalLowStock = lowStockComponents.length + lowStockProducts.length;

  // Collect all part work orders across active POs
  const allPartOrders = activePOs.flatMap((po) => po.partWorkOrders);
  
  // Bottlenecks count
  const bottlenecks = allPartOrders.filter(
    (pwo) => pwo.bottleneckAlert || pwo.status === 'QC Flagged'
  );

  // Count active part units per stage
  const stageUnitCounts: Record<StageId, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0
  };

  allPartOrders.forEach((pwo) => {
    stageUnitCounts[pwo.currentStage] = (stageUnitCounts[pwo.currentStage] || 0) + pwo.totalRequired;
  });

  const chartData = PRODUCTION_STAGES.map((st) => ({
    name: st.shortName,
    fullName: st.name,
    units: stageUnitCounts[st.id] || 0,
    isQc: st.isQcStage,
    id: st.id
  }));

  // Identify top bottleneck stage
  let maxStageUnits = 0;
  let topBottleneckStage = 'Polishing';
  chartData.forEach((cd) => {
    if (cd.units > maxStageUnits) {
      maxStageUnits = cd.units;
      topBottleneckStage = cd.fullName;
    }
  });

  // 7-day sparkline velocity trends data (Last 7 days output & efficiency)
  const outputVelocityData = [
    { day: 'Jul 24', value: 185 },
    { day: 'Jul 25', value: 210 },
    { day: 'Jul 26', value: 245 },
    { day: 'Jul 27', value: 220 },
    { day: 'Jul 28', value: 190 },
    { day: 'Jul 29', value: 165 },
    { day: 'Jul 30', value: 140 },
  ];

  const qualityYieldData = [
    { day: 'Jul 24', value: 98.2 },
    { day: 'Jul 25', value: 97.5 },
    { day: 'Jul 26', value: 96.0 },
    { day: 'Jul 27', value: 94.2 },
    { day: 'Jul 28', value: 91.8 },
    { day: 'Jul 29', value: 89.1 },
    { day: 'Jul 30', value: 86.5 },
  ];

  const stationMovesData = [
    { day: 'Jul 24', value: 42 },
    { day: 'Jul 25', value: 48 },
    { day: 'Jul 26', value: 54 },
    { day: 'Jul 27', value: 49 },
    { day: 'Jul 28', value: 41 },
    { day: 'Jul 29', value: 35 },
    { day: 'Jul 30', value: 28 },
  ];

  const defectTrendData = [
    { day: 'Jul 24', value: 3 },
    { day: 'Jul 25', value: 5 },
    { day: 'Jul 26', value: 8 },
    { day: 'Jul 27', value: 12 },
    { day: 'Jul 28', value: 15 },
    { day: 'Jul 29', value: 19 },
    { day: 'Jul 30', value: 24 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert for Bottlenecks */}
      {bottlenecks.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl ring-1 ring-rose-200">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-900 flex items-center gap-2">
                Critical Shop Floor Bottleneck Detected!
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 font-bold">
                  {bottlenecks.length} Flagged Batch{bottlenecks.length > 1 ? 'es' : ''}
                </span>
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                {bottlenecks[0]?.partName} ({bottlenecks[0]?.partCode}) is delayed in {PRODUCTION_STAGES.find(s => s.id === bottlenecks[0]?.currentStage)?.name}.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedPoIdForMatrix(bottlenecks[0]?.poId);
              setActiveTab('kanban');
            }}
            className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <span>Open Production Board</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 7-Day Production Output & Velocity Trend Sparklines Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>7-Day Production Output & Velocity Trends</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-amber-600" />
                  Efficiency Drop Alert
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inline sparklines tracking daily units output, first-pass yield, station transitions, and defect rate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200/80">
              Last 7 Days (Jul 24 - Jul 30)
            </span>
          </div>
        </div>

        {/* Sparkline Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Sparkline 1: Daily Units Output Velocity */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2 hover:bg-white hover:border-slate-300 transition-all shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>Output Volume Velocity</span>
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3 text-amber-600" />
                -24.3%
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xl font-black text-slate-900 font-mono">140</span>
                <span className="text-[11px] text-slate-500 font-medium ml-1">units/day</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Peak: 245 units</span>
            </div>

            {/* Sparkline Chart */}
            <InlineSparkline
              data={outputVelocityData}
              color="#2563eb"
              gradientId="sparkline-output"
            />

            <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-mono">
              <span>Jul 24</span>
              <span>Jul 27</span>
              <span className="font-bold text-slate-700">Today</span>
            </div>
          </div>

          {/* Sparkline 2: First-Pass Quality Yield % */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2 hover:bg-white hover:border-slate-300 transition-all shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>First-Pass Yield %</span>
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3 text-rose-600" />
                -11.7%
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xl font-black text-slate-900 font-mono">86.5%</span>
                <span className="text-[11px] text-slate-500 font-medium ml-1">pass rate</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">7d Avg: 93.3%</span>
            </div>

            {/* Sparkline Chart */}
            <InlineSparkline
              data={qualityYieldData}
              color="#f59e0b"
              gradientId="sparkline-yield"
            />

            <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-mono">
              <span>98.2%</span>
              <span>94.2%</span>
              <span className="font-bold text-rose-600">86.5%</span>
            </div>
          </div>

          {/* Sparkline 3: Station Transition Rate */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2 hover:bg-white hover:border-slate-300 transition-all shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-purple-600" />
                <span>Stage Moves / Day</span>
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3 text-amber-600" />
                -33.3%
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xl font-black text-slate-900 font-mono">28</span>
                <span className="text-[11px] text-slate-500 font-medium ml-1">moves today</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">7d Avg: 42 moves</span>
            </div>

            {/* Sparkline Chart */}
            <InlineSparkline
              data={stationMovesData}
              color="#8b5cf6"
              gradientId="sparkline-moves"
            />

            <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-mono">
              <span>42</span>
              <span>49</span>
              <span className="font-bold text-slate-700">28</span>
            </div>
          </div>

          {/* Sparkline 4: Defect / Rejection Volume */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2 hover:bg-white hover:border-slate-300 transition-all shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Defects Flagged / Day</span>
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 text-rose-600" />
                +700%
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xl font-black text-rose-600 font-mono">24</span>
                <span className="text-[11px] text-slate-500 font-medium ml-1">defects today</span>
              </div>
              <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-1 rounded">Attention</span>
            </div>

            {/* Sparkline Chart */}
            <InlineSparkline
              data={defectTrendData}
              color="#f43f5e"
              gradientId="sparkline-defects"
            />

            <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-mono">
              <span>3</span>
              <span>12</span>
              <span className="font-bold text-rose-600">24</span>
            </div>
          </div>

        </div>
      </div>

      {/* KPI Metric Cards Grid - Matching screenshot style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* ORDERS IN PROD */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              ORDERS IN PROD.
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {activePOs.length}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Active Purchase Orders</p>
          </div>
        </div>

        {/* COMPLETED */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              COMPLETED
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {completedPOs.length}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Dispatched Orders</p>
          </div>
        </div>

        {/* PARTS ACTIVE */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              PARTS ACTIVE
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Puzzle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {allPartOrders.length}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Active Work Orders</p>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              PRODUCTS
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {state.products.length}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Finished Catalog</p>
          </div>
        </div>

        {/* COMPONENTS */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              COMPONENTS
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {state.components.length}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Raw Parts</p>
          </div>
        </div>

        {/* LOW STOCK */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              LOW STOCK
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600 tracking-tight">
              {totalLowStock}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Items Below Reorder</p>
          </div>
        </div>

      </div>

      {/* Main 12-Stage Parts Bar Chart Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Parts by Production Stage
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                Bottleneck: {topBottleneckStage} ({maxStageUnits} units)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live part quantities across all 12 manufacturing and quality control stages
            </p>
          </div>

          <button
            onClick={() => setActiveTab('kanban')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Kanban Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stage Volume Bar Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                interval={0}
                angle={-20}
                textAnchor="end"
                fontWeight={600}
              />
              <YAxis stroke="#64748b" fontSize={11} fontWeight={600} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xl text-xs border border-slate-800">
                        <p className="font-bold text-blue-400">
                          Stage {data.id}: {data.fullName}
                        </p>
                        <p className="text-slate-200 mt-1 font-semibold">
                          Active Batch Qty: {data.units} Units
                        </p>
                        {data.isQc && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded font-bold">
                            QC Checkpoint
                          </span>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="units" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isQc
                        ? '#10b981' // Emerald for QC stages
                        : entry.id === 10
                        ? '#8b5cf6' // Purple for Assembly
                        : '#2563eb' // Blue for manufacturing
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-slate-500 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
            <span className="font-medium">Production Operation Stations</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="font-medium">Quality Inspection Checkpoints</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
            <span className="font-medium">Assembly & Kitting</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Low Stock Alerts + Active POs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alerts Panel */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Low Stock Alerts
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('components')}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Manage Component Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {[...lowStockComponents, ...lowStockProducts].length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                All inventory items are well stocked!
              </div>
            ) : (
              [...lowStockComponents, ...lowStockProducts].map((item) => {
                const isComponent = 'partCode' in item;
                const code = isComponent ? (item as any).partCode : (item as any).sku;
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border">
                          {code}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {isComponent ? `Material: ${(item as any).material}` : `Category: ${(item as any).category}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-rose-600 block">
                        {item.stockQty} / {item.reorderPoint}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Min Alert</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Active POs Overview */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Active Purchase Orders
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              View Orders &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {activePOs.map((po) => (
              <div
                key={po.id}
                className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-blue-600">{po.poNumber}</span>
                    <span className="text-slate-800 font-medium">{po.clientName}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Total Value: ${po.totalAmount.toLocaleString()} • Delivery: {po.targetDeliveryDate}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedPoIdForMatrix(po.id);
                    setActiveTab('kanban');
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold text-[11px] shadow-2xs cursor-pointer"
                >
                  Track Board
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
