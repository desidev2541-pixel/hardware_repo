import React, { useState } from 'react';
import {
  ErpDataState,
  InventoryComponent,
  InventoryProduct,
  ItemCategory,
  MaterialType,
  HardwareFinish,
  BomItem
} from '../types/erp';
import {
  Package,
  Boxes,
  Plus,
  Filter,
  AlertTriangle,
  Layers,
  Edit,
  Trash2,
  Wrench,
  X,
  LayoutGrid,
  List,
  Upload,
  Image as ImageIcon,
  Check,
  Tag,
  DollarSign,
  Info,
  ShieldAlert,
  Download
} from 'lucide-react';

interface InventoryManagerProps {
  state: ErpDataState;
  setState: React.Dispatch<React.SetStateAction<ErpDataState>>;
  searchQuery: string;
}

const SAMPLE_PRESET_IMAGES = [
  { label: 'Solid Brass Lever', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80' },
  { label: 'Matt Black Handle', url: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?auto=format&fit=crop&w=600&q=80' },
  { label: 'Mortise Lock Body', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80' },
  { label: 'Knurled Brass Knob', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80' },
  { label: 'Round Rose Plate', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80' },
  { label: 'Screws & Fasteners', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80' },
];

const HardwareImage: React.FC<{ src?: string; alt: string; className?: string }> = ({ src, alt, className = "w-full h-44 object-cover" }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={`bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-400 p-4 border-b border-slate-200/80 ${className}`}>
        <Package className="w-10 h-10 mb-1 opacity-40 text-slate-500" />
        <span className="text-[11px] font-semibold text-slate-500">No Image Preview</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
    />
  );
};

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  state,
  setState,
  searchQuery,
}) => {
  const [activeTab, setActiveTab] = useState<'finished' | 'components'>('finished');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState<boolean>(false);

  // Modals
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState<boolean>(false);
  const [isNewComponentModalOpen, setIsNewComponentModalOpen] = useState<boolean>(false);
  const [selectedBomProduct, setSelectedBomProduct] = useState<InventoryProduct | null>(null);

  // Form State for New Product
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ItemCategory>('Lever Handles');
  const [newProdPrice, setNewProdPrice] = useState(65.0);
  const [newProdCost, setNewProdCost] = useState(25.0);
  const [newProdStock, setNewProdStock] = useState(100);
  const [newProdReorder, setNewProdReorder] = useState(30);
  const [newProdFinish, setNewProdFinish] = useState<HardwareFinish>('Satin Brass');
  const [newProdImageUrl, setNewProdImageUrl] = useState<string>('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80');
  const [newProdBom, setNewProdBom] = useState<BomItem[]>([
    { componentId: state.components[0]?.id || '', qtyRequiredPerUnit: 1 },
    { componentId: state.components[2]?.id || '', qtyRequiredPerUnit: 2 },
    { componentId: state.components[4]?.id || '', qtyRequiredPerUnit: 1 },
  ]);

  // Form State for New Component
  const [newCompName, setNewCompName] = useState('');
  const [newCompCode, setNewCompCode] = useState('');
  const [newCompMaterial, setNewCompMaterial] = useState<MaterialType>('Solid Brass');
  const [newCompDimensions, setNewCompDimensions] = useState('120mm x 45mm x 12mm');
  const [newCompSupplier, setNewCompSupplier] = useState('Anand Brass Foundry');
  const [newCompCost, setNewCompCost] = useState(5.0);
  const [newCompStock, setNewCompStock] = useState(500);
  const [newCompReorder, setNewCompReorder] = useState(150);
  const [newCompCanSell, setNewCompCanSell] = useState(true);
  const [newCompDirectPrice, setNewCompDirectPrice] = useState(12.0);
  const [newCompImageUrl, setNewCompImageUrl] = useState<string>('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80');

  // Filtered Finished Products
  const filteredProducts = state.products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesLow = !showLowStockOnly || p.stockQty <= p.reorderPoint;
    return matchesSearch && matchesCat && matchesLow;
  });

  // Filtered Components
  const filteredComponents = state.components.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.material.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMat = selectedMaterial === 'ALL' || c.material === selectedMaterial;
    const matchesLow = !showLowStockOnly || c.stockQty <= c.reorderPoint;
    return matchesSearch && matchesMat && matchesLow;
  });

  // Handlers for Stock Adjustment
  const handleUpdateProductStock = (productId: string, delta: number) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, stockQty: Math.max(0, p.stockQty + delta) } : p
      ),
    }));
  };

  const handleUpdateComponentStock = (componentId: string, delta: number) => {
    setState((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.id === componentId ? { ...c, stockQty: Math.max(0, c.stockQty + delta) } : c
      ),
    }));
  };

  // Image Upload helper
  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setTargetUrl: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setTargetUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdSku) return;

    const newProd: InventoryProduct = {
      id: `prd-${Date.now()}`,
      sku: newProdSku.toUpperCase(),
      name: newProdName,
      category: newProdCategory,
      description: `Custom manufactured ${newProdCategory} set.`,
      unitPrice: newProdPrice,
      unitCost: newProdCost,
      stockQty: newProdStock,
      reorderPoint: newProdReorder,
      leadTimeDays: 14,
      defaultFinish: newProdFinish,
      imageUrl: newProdImageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
      bom: newProdBom,
    };

    setState((prev) => ({
      ...prev,
      products: [newProd, ...prev.products],
    }));

    setIsNewProductModalOpen(false);
    setNewProdName('');
    setNewProdSku('');
  };

  // Add Component
  const handleCreateComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName || !newCompCode) return;

    const newComp: InventoryComponent = {
      id: `cmp-${Date.now()}`,
      partCode: newCompCode.toUpperCase(),
      name: newCompName,
      material: newCompMaterial,
      dimensions: newCompDimensions || '120mm x 45mm x 12mm',
      supplier: newCompSupplier || 'Anand Brass Foundry',
      description: `Factory machined component (${newCompMaterial}).`,
      stockQty: newCompStock,
      reorderPoint: newCompReorder,
      unitCost: newCompCost,
      defaultFinish: 'Satin Brass',
      canSellDirectly: newCompCanSell,
      directPrice: newCompCanSell ? newCompDirectPrice : undefined,
      parentProductIds: [],
      imageUrl: newCompImageUrl || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    };

    setState((prev) => ({
      ...prev,
      components: [newComp, ...prev.components],
    }));

    setIsNewComponentModalOpen(false);
    setNewCompName('');
    setNewCompCode('');
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    const escapeCsv = (val: string | number | boolean | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    if (activeTab === 'finished') {
      const headers = [
        'Product ID',
        'SKU',
        'Name',
        'Category',
        'Finish',
        'Unit Price ($)',
        'Unit Cost ($)',
        'Margin ($)',
        'Stock Qty',
        'Reorder Point',
        'Stock Status',
        'BOM Component Count'
      ];

      const rows = filteredProducts.map((p) => {
        const isLow = p.stockQty <= p.reorderPoint;
        const profit = p.unitPrice - p.unitCost;
        return [
          p.id,
          p.sku,
          p.name,
          p.category,
          p.defaultFinish,
          p.unitPrice.toFixed(2),
          p.unitCost.toFixed(2),
          profit.toFixed(2),
          p.stockQty,
          p.reorderPoint,
          isLow ? 'LOW STOCK' : 'IN STOCK',
          p.bom.length
        ];
      });

      const csvString = [
        headers.map(escapeCsv).join(','),
        ...rows.map((row) => row.map(escapeCsv).join(','))
      ].join('\n');

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Finished_Products_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const headers = [
        'Part ID',
        'Part Code',
        'Name',
        'Material',
        'Dimensions',
        'Supplier',
        'Default Finish',
        'Unit Cost ($)',
        'Can Sell Direct',
        'Direct Price ($)',
        'Stock Qty',
        'Reorder Point',
        'Stock Status',
        'Assemblies Count'
      ];

      const rows = filteredComponents.map((c) => {
        const isLow = c.stockQty <= c.reorderPoint;
        return [
          c.id,
          c.partCode,
          c.name,
          c.material,
          c.dimensions || 'N/A',
          c.supplier || 'N/A',
          c.defaultFinish,
          c.unitCost.toFixed(2),
          c.canSellDirectly ? 'Yes' : 'No',
          c.canSellDirectly && c.directPrice ? c.directPrice.toFixed(2) : 'N/A',
          c.stockQty,
          c.reorderPoint,
          isLow ? 'LOW STOCK' : 'IN STOCK',
          c.parentProductIds.length
        ];
      });

      const csvString = [
        headers.map(escapeCsv).join(','),
        ...rows.map((row) => row.map(escapeCsv).join(','))
      ].join('\n');

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Component_Parts_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Dual Inventory Management System
            </h2>
            <p className="text-xs text-slate-500">
              Manage complete finished products & component parts with full image verification and BOM structure.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs border border-emerald-200/90 shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
            title={`Download ${activeTab === 'finished' ? 'Finished Products' : 'Component Parts'} as CSV`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download CSV</span>
          </button>

          {/* Finished vs Components Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setActiveTab('finished')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'finished'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Finished Products ({state.products.length})
            </button>
            <button
              onClick={() => setActiveTab('components')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'components'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Component Parts ({state.components.length})
            </button>
          </div>

          {/* View Mode Toggle (Cards vs Table) */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card View with Images"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Compact Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {activeTab === 'finished' ? (
            <button
              onClick={() => setIsNewProductModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Finished Product</span>
            </button>
          ) : (
            <button
              onClick={() => setIsNewComponentModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Component Part</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-xl p-3.5 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter By:</span>
          </div>

          {activeTab === 'finished' ? (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="Lever Handles">Lever Handles</option>
              <option value="Mortise Locks">Mortise Locks</option>
              <option value="Cabinet Knobs">Cabinet Knobs</option>
              <option value="Pull Handles">Pull Handles</option>
              <option value="Hinges">Hinges</option>
            </select>
          ) : (
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">All Materials</option>
              <option value="Solid Brass">Solid Brass</option>
              <option value="Stainless Steel 304">Stainless Steel 304</option>
              <option value="Zinc Alloy">Zinc Alloy</option>
              <option value="Mild Steel">Mild Steel</option>
              <option value="Nylon/Polymer">Nylon/Polymer</option>
            </select>
          )}

          <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="rounded bg-slate-100 border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>Show Low Stock Only</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
            title="Download CSV report of currently filtered stock list"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <div className="text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{activeTab === 'finished' ? filteredProducts.length : filteredComponents.length}</span> items
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FINISHED PRODUCTS (CARDS VS TABLE)                                 */}
      {/* ========================================================================= */}
      {activeTab === 'finished' && (
        <>
          {viewMode === 'cards' ? (
            /* CARD GRID VIEW FOR FINISHED PRODUCTS */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((p) => {
                const isLow = p.stockQty <= p.reorderPoint;
                const profit = p.unitPrice - p.unitCost;
                const marginPct = ((profit / p.unitPrice) * 100).toFixed(0);

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Thumbnail Header */}
                      <div className="relative bg-slate-100 aspect-16/10 overflow-hidden">
                        <HardwareImage
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Overlay Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                          <span className="font-mono text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
                            {p.sku}
                          </span>
                          <span className="text-[10px] font-semibold bg-blue-600/90 text-white backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
                            {p.category}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5">
                          <span className="text-[10px] font-bold bg-amber-500/90 text-white backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
                            {p.defaultFinish}
                          </span>
                        </div>

                        {isLow && (
                          <div className="absolute bottom-2.5 left-2.5">
                            <span className="px-2 py-0.5 text-[10px] bg-rose-600 text-white font-bold rounded-md shadow-xs flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock Alert
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-3">
                        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                          {p.name}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>

                        {/* Price & Margin Breakdown */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Selling Price</span>
                            <span className="font-mono font-bold text-emerald-600 text-sm">${p.unitPrice.toFixed(2)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Cost / Margin</span>
                            <span className="font-mono text-slate-600 font-medium">
                              ${p.unitCost.toFixed(2)} <span className="text-blue-600 font-bold text-[10px]">({marginPct}%)</span>
                            </span>
                          </div>
                        </div>

                        {/* Stock Adjustment Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Stock On Hand:</span>
                            <span className={`font-mono font-bold ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                              {p.stockQty} <span className="text-slate-400 font-normal">/ {p.reorderPoint} min</span>
                            </span>
                          </div>

                          {/* Visual Progress Bar */}
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, (p.stockQty / (p.reorderPoint * 2)) * 100)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleUpdateProductStock(p.id, -10)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 cursor-pointer text-xs"
                                title="Subtract 10 units"
                              >
                                -10
                              </button>
                              <button
                                onClick={() => handleUpdateProductStock(p.id, +10)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 cursor-pointer text-xs"
                                title="Add 10 units"
                              >
                                +10
                              </button>
                            </div>

                            <button
                              onClick={() => setSelectedBomProduct(p)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 cursor-pointer text-[11px] flex items-center gap-1"
                            >
                              <Wrench className="w-3 h-3 text-amber-600" />
                              <span>BOM ({p.bom.length})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW FOR FINISHED PRODUCTS */
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Image & Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Finish</th>
                      <th className="py-3.5 px-4">Selling Price</th>
                      <th className="py-3.5 px-4">Stock Qty</th>
                      <th className="py-3.5 px-4">BOM Composition</th>
                      <th className="py-3.5 px-4 text-right">Stock Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredProducts.map((p) => {
                      const isLow = p.stockQty <= p.reorderPoint;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-12 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80';
                                }}
                              />
                              <div>
                                <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                                <div className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded w-fit mt-0.5">
                                  {p.sku}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[11px]">
                              {p.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {p.defaultFinish}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                            ${p.unitPrice.toFixed(2)}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono font-bold text-xs ${isLow ? 'text-rose-600 font-extrabold' : 'text-slate-900'}`}>
                                {p.stockQty} / {p.reorderPoint}
                              </span>
                              {isLow && (
                                <span className="px-2 py-0.5 text-[10px] bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  Low Stock
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => setSelectedBomProduct(p)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                            >
                              <Wrench className="w-3.5 h-3.5 text-amber-600" />
                              <span>View BOM ({p.bom.length} Parts)</span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleUpdateProductStock(p.id, -10)}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold border border-slate-200 cursor-pointer text-xs"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleUpdateProductStock(p.id, +10)}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold border border-slate-200 cursor-pointer text-xs"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPONENT PARTS (CARDS VS TABLE)                                   */}
      {/* ========================================================================= */}
      {activeTab === 'components' && (
        <>
          {viewMode === 'cards' ? (
            /* CARD GRID VIEW FOR COMPONENTS */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredComponents.map((c) => {
                const isLow = c.stockQty <= c.reorderPoint;

                return (
                  <div
                    key={c.id}
                    className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Thumbnail Header */}
                      <div className="relative bg-slate-100 aspect-16/10 overflow-hidden">
                        <HardwareImage
                          src={c.imageUrl}
                          alt={c.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                          <span className="font-mono text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
                            {c.partCode}
                          </span>
                          <span className="text-[10px] font-semibold bg-emerald-600/90 text-white backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
                            {c.material}
                          </span>
                        </div>

                        {c.canSellDirectly && (
                          <div className="absolute top-2.5 right-2.5">
                            <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              Direct Sale OK
                            </span>
                          </div>
                        )}

                        {isLow && (
                          <div className="absolute bottom-2.5 left-2.5">
                            <span className="px-2 py-0.5 text-[10px] bg-rose-600 text-white font-bold rounded-md shadow-xs flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-3">
                        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                          {c.name}
                        </h3>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Dimensions</span>
                            <span className="font-medium text-slate-700 truncate block">{c.dimensions}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Supplier</span>
                            <span className="font-medium text-slate-700 truncate block">{c.supplier}</span>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center justify-between text-xs pt-0.5">
                          <div>
                            <span className="text-slate-500">Unit Cost:</span>
                            <span className="font-mono font-bold text-slate-900 ml-1.5">${c.unitCost.toFixed(2)}</span>
                          </div>
                          {c.canSellDirectly && c.directPrice && (
                            <div>
                              <span className="text-slate-500">Direct Price:</span>
                              <span className="font-mono font-bold text-emerald-600 ml-1.5">${c.directPrice.toFixed(2)}</span>
                            </div>
                          )}
                        </div>

                        {/* Stock Level Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Part Stock:</span>
                            <span className={`font-mono font-bold ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                              {c.stockQty} <span className="text-slate-400 font-normal">/ {c.reorderPoint} min</span>
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${isLow ? 'bg-rose-500' : 'bg-blue-600'}`}
                              style={{ width: `${Math.min(100, (c.stockQty / (c.reorderPoint * 2)) * 100)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleUpdateComponentStock(c.id, -50)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 cursor-pointer text-xs"
                                title="Subtract 50 units"
                              >
                                -50
                              </button>
                              <button
                                onClick={() => handleUpdateComponentStock(c.id, +50)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 cursor-pointer text-xs"
                                title="Add 50 units"
                              >
                                +50
                              </button>
                            </div>

                            <span className="text-[10px] text-slate-400 font-medium italic">
                              Used in {c.parentProductIds.length} Assemblies
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW FOR COMPONENTS */
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Image & Part Code</th>
                      <th className="py-3.5 px-4">Material & Finish</th>
                      <th className="py-3.5 px-4">Dimensions</th>
                      <th className="py-3.5 px-4">Supplier</th>
                      <th className="py-3.5 px-4">Unit Cost / Sale Price</th>
                      <th className="py-3.5 px-4">Stock Qty & Alert</th>
                      <th className="py-3.5 px-4 text-right">Stock Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredComponents.map((c) => {
                      const isLow = c.stockQty <= c.reorderPoint;
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={c.imageUrl}
                                alt={c.name}
                                className="w-12 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80';
                                }}
                              />
                              <div>
                                <div className="font-bold text-slate-900 text-xs">{c.name}</div>
                                <div className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded w-fit mt-0.5">
                                  {c.partCode}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 block w-fit text-[11px]">
                                {c.material}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Finish: {c.defaultFinish}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-medium text-slate-600">
                            {c.dimensions || 'Standard'}
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            {c.supplier || 'Internal Production'}
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            <span className="text-slate-800 font-semibold block">Cost: ${c.unitCost.toFixed(2)}</span>
                            {c.canSellDirectly && c.directPrice && (
                              <span className="text-emerald-600 font-bold block text-[11px]">
                                Direct Sale: ${c.directPrice.toFixed(2)}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono font-bold text-xs ${isLow ? 'text-rose-600 font-extrabold' : 'text-slate-900'}`}>
                                {c.stockQty} / {c.reorderPoint}
                              </span>
                              {isLow && (
                                <span className="px-2 py-0.5 text-[10px] bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  Low Stock
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleUpdateComponentStock(c.id, -50)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold border border-slate-200 cursor-pointer"
                                title="Decrease Stock"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleUpdateComponentStock(c.id, +50)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold border border-slate-200 cursor-pointer"
                                title="Increase Stock"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW FINISHED PRODUCT WITH IMAGE UPLOAD                       */}
      {/* ========================================================================= */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Create New Finished Product Assembly
                </h3>
              </div>
              <button
                onClick={() => setIsNewProductModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {/* Product Image Section */}
              <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Product Image (Upload or Pick Preset)</span>
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                </label>

                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                    <img
                      src={newProdImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">Option 1: Upload Local Image</span>
                      <label className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-lg cursor-pointer inline-flex items-center gap-1.5 shadow-xs text-xs">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Browse Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileUpload(e, setNewProdImageUrl)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">Option 2: Image URL</span>
                      <input
                        type="url"
                        value={newProdImageUrl}
                        onChange={(e) => setNewProdImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_PRESET_IMAGES.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setNewProdImageUrl(preset.url)}
                        className={`px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer transition-colors ${
                          newProdImageUrl === preset.url
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* General Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. Royal Sovereign Brass Lever Handle"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product SKU *</label>
                  <input
                    type="text"
                    required
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    placeholder="e.g. PRD-H300"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as ItemCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900"
                  >
                    <option value="Lever Handles">Lever Handles</option>
                    <option value="Mortise Locks">Mortise Locks</option>
                    <option value="Cabinet Knobs">Cabinet Knobs</option>
                    <option value="Pull Handles">Pull Handles</option>
                    <option value="Hinges">Hinges</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Default Hardware Finish</label>
                  <select
                    value={newProdFinish}
                    onChange={(e) => setNewProdFinish(e.target.value as HardwareFinish)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900"
                  >
                    <option value="Satin Brass">Satin Brass</option>
                    <option value="Antique Brass">Antique Brass</option>
                    <option value="Matt Black">Matt Black</option>
                    <option value="Satin Chrome">Satin Chrome</option>
                    <option value="Polished Chrome">Polished Chrome</option>
                    <option value="Rose Gold PVD">Rose Gold PVD</option>
                  </select>
                </div>
              </div>

              {/* Financials & Stock */}
              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reorder Point</label>
                  <input
                    type="number"
                    value={newProdReorder}
                    onChange={(e) => setNewProdReorder(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono font-bold text-rose-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW COMPONENT PART WITH IMAGE UPLOAD                        */}
      {/* ========================================================================= */}
      {isNewComponentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Add New Component / Raw Part
                </h3>
              </div>
              <button
                onClick={() => setIsNewComponentModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateComponent} className="space-y-4 text-xs">
              {/* Image Section */}
              <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Part Image (Upload or Pick Preset)</span>
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                </label>

                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                    <img
                      src={newCompImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">Option 1: Upload Local Image</span>
                      <label className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-lg cursor-pointer inline-flex items-center gap-1.5 shadow-xs text-xs">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Browse Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileUpload(e, setNewCompImageUrl)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">Option 2: Image URL</span>
                      <input
                        type="url"
                        value={newCompImageUrl}
                        onChange={(e) => setNewCompImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_PRESET_IMAGES.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setNewCompImageUrl(preset.url)}
                        className={`px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer transition-colors ${
                          newCompImageUrl === preset.url
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Component Name *</label>
                  <input
                    type="text"
                    required
                    value={newCompName}
                    onChange={(e) => setNewCompName(e.target.value)}
                    placeholder="e.g. Forged Brass Lever Blade (Right)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Part Code *</label>
                  <input
                    type="text"
                    required
                    value={newCompCode}
                    onChange={(e) => setNewCompCode(e.target.value)}
                    placeholder="e.g. CMP-LVR-03"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Material</label>
                  <select
                    value={newCompMaterial}
                    onChange={(e) => setNewCompMaterial(e.target.value as MaterialType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900"
                  >
                    <option value="Solid Brass">Solid Brass</option>
                    <option value="Stainless Steel 304">Stainless Steel 304</option>
                    <option value="Zinc Alloy">Zinc Alloy</option>
                    <option value="Mild Steel">Mild Steel</option>
                    <option value="Nylon/Polymer">Nylon/Polymer</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={newCompDimensions}
                    onChange={(e) => setNewCompDimensions(e.target.value)}
                    placeholder="120mm x 45mm x 12mm"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Direct Sale Toggle */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-blue-900">
                  <input
                    type="checkbox"
                    checked={newCompCanSell}
                    onChange={(e) => setNewCompCanSell(e.target.checked)}
                    className="rounded bg-white border-blue-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Allow Direct Sale to Buyers (Spare Component)</span>
                </label>

                {newCompCanSell && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-slate-600 font-medium">Direct Selling Price ($):</span>
                    <input
                      type="number"
                      step="0.5"
                      value={newCompDirectPrice}
                      onChange={(e) => setNewCompDirectPrice(Number(e.target.value))}
                      className="w-28 bg-white border border-blue-200 rounded-lg p-1.5 font-mono font-bold text-emerald-600"
                    />
                  </div>
                )}
              </div>

              {/* Financials & Stock */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCompCost}
                    onChange={(e) => setNewCompCost(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Qty</label>
                  <input
                    type="number"
                    value={newCompStock}
                    onChange={(e) => setNewCompStock(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Reorder Alert</label>
                  <input
                    type="number"
                    value={newCompReorder}
                    onChange={(e) => setNewCompReorder(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono font-bold text-rose-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewComponentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Save Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BOM INSPECTION MODAL                                             */}
      {/* ========================================================================= */}
      {selectedBomProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedBomProduct.imageUrl}
                  alt={selectedBomProduct.name}
                  className="w-12 h-12 object-cover rounded-xl border border-slate-200"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                    {selectedBomProduct.sku}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Bill of Materials — {selectedBomProduct.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedBomProduct(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                This finished product assembly requires the following raw component parts to manufacture 1 finished unit:
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Part</th>
                      <th className="p-3">Material</th>
                      <th className="p-3">Qty Required / Unit</th>
                      <th className="p-3">Current Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedBomProduct.bom.map((bItem, idx) => {
                      const comp = state.components.find((c) => c.id === bItem.componentId);
                      if (!comp) return null;
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={comp.imageUrl}
                                alt={comp.name}
                                className="w-8 h-8 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80';
                                }}
                              />
                              <div>
                                <p className="font-bold text-slate-900">{comp.name}</p>
                                <p className="font-mono text-[10px] text-blue-600">{comp.partCode}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-slate-600 font-medium">{comp.material}</td>
                          <td className="p-3 font-mono font-bold text-blue-600">
                            {bItem.qtyRequiredPerUnit} pcs
                          </td>
                          <td className="p-3 font-mono">
                            <span className={comp.stockQty < comp.reorderPoint ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                              {comp.stockQty} pcs
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBomProduct(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Close BOM View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
