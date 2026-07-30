import React, { useState, useRef, useEffect } from 'react';
import {
  ErpDataState,
  PurchaseOrder,
  OrderItem,
  PartWorkOrder,
  Client,
  PRODUCTION_STAGES
} from '../types/erp';
import {
  Plus,
  Trash2,
  X,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Sparkles,
  Upload,
  FileSpreadsheet,
  FileText,
  Download,
  FileCheck,
  PackageCheck,
  Edit3,
  Building2,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface NewOrderModalProps {
  state: ErpDataState;
  setState: React.Dispatch<React.SetStateAction<ErpDataState>>;
  onClose: () => void;
  setSelectedPoIdForMatrix: (poId: string) => void;
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'production' | 'matrix' | 'terminal' | 'qc' | 'products' | 'orders' | 'kanban' | 'users' | 'clients') => void;
  preselectedClient?: Client | null;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  state,
  setState,
  onClose,
  setSelectedPoIdForMatrix,
  setActiveTab,
  preselectedClient,
}) => {
  const [creationMode, setCreationMode] = useState<'manual' | 'upload'>('manual');
  const [poNumber, setPoNumber] = useState(`PO-2026-${Math.floor(100 + Math.random() * 900)}`);
  
  // Client selection state
  const initialClient = preselectedClient || state.clients[0] || null;
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClient?.id || 'custom');
  const [clientName, setClientName] = useState(initialClient?.name || 'Apex Hotel Group');
  const [clientEmail, setClientEmail] = useState(initialClient?.email || 'orders@apexhotel.com');
  const [clientPhone, setClientPhone] = useState(initialClient?.phone || '+1 (555) 019-2831');
  const [deliveryAddress, setDeliveryAddress] = useState(initialClient?.deliveryAddress || '742 Evergreen Terrace, Logistics Bay 4, Chicago, IL 60607');
  
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('2026-08-30');
  const [priority, setPriority] = useState<'Normal' | 'Urgent' | 'High Priority'>('Urgent');
  const [notes, setNotes] = useState('Custom Satin Brass PVD Finish requested for all lever handles.');

  // Handle Client Selection Dropdown change
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId === 'custom') {
      // Leave fields open for manual entry
      return;
    }
    const found = state.clients.find((c) => c.id === clientId);
    if (found) {
      setClientName(found.name);
      setClientEmail(found.email);
      setClientPhone(found.phone);
      setDeliveryAddress(found.deliveryAddress || '');
    }
  };

  // File Upload State
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Selected Order Line Items
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      type: 'PRODUCT',
      id: state.products[0]?.id || 'prd-1',
      code: state.products[0]?.sku || 'PRD-H101',
      name: state.products[0]?.name || 'Royal Monarch Solid Brass Lever Handle Set',
      quantity: 300,
      unitPrice: state.products[0]?.unitPrice || 68.00,
    }
  ]);

  // BOM Explosion Calculation
  const componentRequirements: Record<string, { compName: string; partCode: string; totalRequired: number; stockAvailable: number }> = {};

  orderItems.forEach((item) => {
    if (item.type === 'PRODUCT') {
      const prod = state.products.find((p) => p.id === item.id || p.sku.toLowerCase() === item.code.toLowerCase());
      if (prod) {
        prod.bom.forEach((bomItem) => {
          const comp = state.components.find((c) => c.id === bomItem.componentId);
          if (comp) {
            const required = bomItem.qtyRequiredPerUnit * item.quantity;
            if (!componentRequirements[comp.id]) {
              componentRequirements[comp.id] = {
                compName: comp.name,
                partCode: comp.partCode,
                totalRequired: 0,
                stockAvailable: comp.stockQty,
              };
            }
            componentRequirements[comp.id].totalRequired += required;
          }
        });
      }
    } else if (item.type === 'COMPONENT') {
      const comp = state.components.find((c) => c.id === item.id || c.partCode.toLowerCase() === item.code.toLowerCase());
      if (comp) {
        if (!componentRequirements[comp.id]) {
          componentRequirements[comp.id] = {
            compName: comp.name,
            partCode: comp.partCode,
            totalRequired: 0,
            stockAvailable: comp.stockQty,
          };
        }
        componentRequirements[comp.id].totalRequired += item.quantity;
      }
    }
  });

  const totalAmount = orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  // Add Item Line
  const handleAddItem = (type: 'PRODUCT' | 'COMPONENT') => {
    if (type === 'PRODUCT' && state.products.length > 0) {
      const p = state.products[0];
      setOrderItems([
        ...orderItems,
        { type: 'PRODUCT', id: p.id, code: p.sku, name: p.name, quantity: 100, unitPrice: p.unitPrice }
      ]);
    } else if (type === 'COMPONENT' && state.components.length > 0) {
      const c = state.components[0];
      setOrderItems([
        ...orderItems,
        { type: 'COMPONENT', id: c.id, code: c.partCode, name: c.name, quantity: 200, unitPrice: c.directPrice || 5.00 }
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Download Sample CSV Template
  const handleDownloadSampleCsv = () => {
    const csvContent = `PO Number,Client Name,Client Email,Target Delivery Date,Priority,Item Code,Item Name,Quantity,Unit Price
PO-2026-999,Grand Hyatt Resort & Spa,orders@hyattgroup.com,2026-09-15,High Priority,PRD-H101,Royal Monarch Solid Brass Lever Handle Set,250,68.00
PO-2026-999,Grand Hyatt Resort & Spa,orders@hyattgroup.com,2026-09-15,High Priority,CMP-LVR-01,Solid Brass Curved Lever Arm (Right),500,12.50`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_purchase_order_format.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV File or PDF Text File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadErrorMsg(null);
    setUploadSuccessMsg(null);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setUploadErrorMsg('Failed to read file content.');
          return;
        }

        // CSV or Text Parsing logic
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          setUploadErrorMsg('File appears empty or does not contain header and data rows.');
          return;
        }

        const parsedItems: OrderItem[] = [];
        let parsedPo = poNumber;
        let parsedClient = clientName;
        let parsedEmail = clientEmail;
        let parsedDate = targetDeliveryDate;
        let parsedPriority = priority;

        // Check if header exists
        const header = lines[0].toLowerCase();
        const startIndex = header.includes('po number') || header.includes('client') || header.includes('item') ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const row = lines[i].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
          if (row.length >= 3) {
            if (row[0] && row[0].startsWith('PO-')) parsedPo = row[0];
            if (row[1]) parsedClient = row[1];
            if (row[2] && row[2].includes('@')) parsedEmail = row[2];
            if (row[3] && row[3].match(/^\d{4}-\d{2}-\d{2}$/)) parsedDate = row[3];
            if (row[4] && ['Normal', 'Urgent', 'High Priority'].includes(row[4])) parsedPriority = row[4] as any;

            const itemCode = row[5] || row[0] || 'PRD-H101';
            const itemName = row[6] || row[1] || 'Imported Line Item';
            const qty = parseInt(row[7] || row[2] || '100') || 100;
            const price = parseFloat(row[8] || row[3] || '50.00') || 50.0;

            // Match item code against products or components in system
            const matchedProduct = state.products.find(p => p.sku.toLowerCase() === itemCode.toLowerCase() || p.name.toLowerCase().includes(itemName.toLowerCase()));
            const matchedComponent = state.components.find(c => c.partCode.toLowerCase() === itemCode.toLowerCase() || c.name.toLowerCase().includes(itemName.toLowerCase()));

            if (matchedProduct) {
              parsedItems.push({
                type: 'PRODUCT',
                id: matchedProduct.id,
                code: matchedProduct.sku,
                name: matchedProduct.name,
                quantity: qty,
                unitPrice: matchedProduct.unitPrice,
              });
            } else if (matchedComponent) {
              parsedItems.push({
                type: 'COMPONENT',
                id: matchedComponent.id,
                code: matchedComponent.partCode,
                name: matchedComponent.name,
                quantity: qty,
                unitPrice: matchedComponent.directPrice || price,
              });
            } else {
              // Default to product or first component
              const defaultProd = state.products[0];
              if (defaultProd) {
                parsedItems.push({
                  type: 'PRODUCT',
                  id: defaultProd.id,
                  code: defaultProd.sku,
                  name: `${itemName} (${itemCode})`,
                  quantity: qty,
                  unitPrice: price,
                });
              }
            }
          }
        }

        if (parsedItems.length > 0) {
          setPoNumber(parsedPo);
          setClientName(parsedClient);
          setClientEmail(parsedEmail);
          setTargetDeliveryDate(parsedDate);
          setPriority(parsedPriority);
          setOrderItems(parsedItems);
          setUploadSuccessMsg(`Successfully imported ${parsedItems.length} line item(s) from "${file.name}"! BOM sub-components exploded below.`);
          setCreationMode('manual'); // Switch back to view auto-filled order details
        } else {
          setUploadErrorMsg('No valid order line items could be parsed from the file.');
        }
      } catch (err) {
        setUploadErrorMsg('Error parsing file. Please check format against sample CSV.');
      }
    };

    reader.readAsText(file);
  };

  // Submit & Auto-Generate Part Work Orders
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0 || !clientName) return;

    const poId = `po-${Date.now()}`;

    // Auto-generate Part Work Orders for all exploded components
    const generatedPartWorkOrders: PartWorkOrder[] = Object.keys(componentRequirements).map((compId, idx) => {
      const compInfo = componentRequirements[compId];

      // Initial Stage 1 progress
      const initialStageProgress: Record<number, any> = {};
      for (let s = 1; s <= 12; s++) {
        initialStageProgress[s] = {
          stageId: s,
          completedQty: s === 1 ? compInfo.totalRequired : 0,
          passedQC: s === 1 ? compInfo.totalRequired : 0,
          defectQty: 0,
          updatedAt: s === 1 ? new Date().toISOString().split('T')[0] : '',
        };
      }

      return {
        id: `pwo-${poId}-${idx + 1}`,
        poId: poId,
        componentId: compId,
        partCode: compInfo.partCode,
        partName: compInfo.compName,
        totalRequired: compInfo.totalRequired,
        currentStage: 1, // Forecasting & Planning
        stageProgress: initialStageProgress,
        status: 'In Progress',
      };
    });

    // Save or register client into state.clients if custom
    let finalClientId = selectedClientId;
    let updatedClientsList = [...state.clients];

    if (selectedClientId === 'custom') {
      // Check if client with same name & phone exists
      const existing = updatedClientsList.find(
        (c) => c.phone.trim() === clientPhone.trim() || (c.name.toLowerCase() === clientName.toLowerCase() && c.email.toLowerCase() === clientEmail.toLowerCase())
      );
      if (existing) {
        finalClientId = existing.id;
      } else {
        const newClientRecord: Client = {
          id: `cli-${Date.now()}`,
          name: clientName.trim(),
          phone: clientPhone.trim() || '+1 (555) 000-0000',
          email: clientEmail.trim(),
          deliveryAddress: deliveryAddress.trim() || undefined,
          createdAt: new Date().toISOString().split('T')[0],
        };
        updatedClientsList = [newClientRecord, ...updatedClientsList];
        finalClientId = newClientRecord.id;
      }
    }

    const newPO: PurchaseOrder = {
      id: poId,
      poNumber,
      clientId: finalClientId !== 'custom' ? finalClientId : undefined,
      clientName,
      clientEmail,
      clientPhone,
      deliveryAddress,
      orderDate: new Date().toISOString().split('T')[0],
      targetDeliveryDate,
      items: orderItems,
      totalAmount,
      overallStatus: 'Forecasting',
      priority,
      notes,
      partWorkOrders: generatedPartWorkOrders,
    };

    setState((prev) => ({
      ...prev,
      purchaseOrders: [newPO, ...prev.purchaseOrders],
      clients: updatedClientsList,
    }));

    setSelectedPoIdForMatrix(poId);
    onClose();
    setActiveTab('matrix');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-fadeIn">
        
        {/* Clean Light Modal Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Create Purchase Order & Auto Explode BOM Parts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Specify client details manually or import a Purchase Order file (CSV / PDF format).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 font-bold flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Creation Mode Tabs */}
        <div className="px-5 pt-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCreationMode('manual')}
              className={`px-4 py-2 font-bold rounded-t-xl transition-all border-t border-x cursor-pointer flex items-center gap-1.5 ${
                creationMode === 'manual'
                  ? 'bg-white border-slate-200 text-blue-600 shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Manual Entry & BOM Form</span>
            </button>

            <button
              type="button"
              onClick={() => setCreationMode('upload')}
              className={`px-4 py-2 font-bold rounded-t-xl transition-all border-t border-x cursor-pointer flex items-center gap-1.5 ${
                creationMode === 'upload'
                  ? 'bg-white border-slate-200 text-blue-600 shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Upload PO File (CSV / PDF)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadSampleCsv}
            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            title="Download CSV Purchase Order Format Template"
          >
            <Download className="w-3 h-3 text-emerald-600" />
            <span>Sample CSV Format</span>
          </button>
        </div>

        {/* Success / Error Banners */}
        {uploadSuccessMsg && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </span>
            <button onClick={() => setUploadSuccessMsg(null)} className="text-emerald-600 font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {uploadErrorMsg && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{uploadErrorMsg}</span>
            </span>
            <button onClick={() => setUploadErrorMsg(null)} className="text-rose-600 font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Main Content Area */}
        {creationMode === 'upload' ? (
          /* File Upload UI Screen */
          <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
            <div className="bg-slate-50 border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center space-y-4 hover:border-blue-500 transition-colors">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900">Upload Purchase Order File</h4>
                <p className="text-xs text-slate-500">
                  Drag and drop your client PO file here, or click to browse files
                </p>
                <p className="text-[11px] text-slate-400 font-medium pt-1">
                  Supports standard CSV spreadsheets (<code className="font-mono text-blue-600 bg-blue-50 px-1 py-0.5 rounded">.csv</code>) and scanned PO text documents (<code className="font-mono text-blue-600 bg-blue-50 px-1 py-0.5 rounded">.pdf / .txt</code>)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Choose File to Import</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Download Sample Format</span>
                </button>
              </div>
            </div>

            {/* CSV Specification Format Reference Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 uppercase tracking-wider text-[10px] font-extrabold block">
                Standard CSV Format Reference Columns:
              </span>
              <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto">
                PO Number, Client Name, Client Email, Delivery Date, Priority, Item Code, Item Name, Quantity, Unit Price
              </div>
              <p className="text-[11px] text-slate-500">
                The ERP matches <code className="font-mono text-slate-900">Item Code</code> against existing hardware finished goods (e.g. <code className="font-mono text-blue-600">PRD-H101</code>) and sub-components (e.g. <code className="font-mono text-blue-600">CMP-LVR-01</code>), automatically exploding BOM required sub-parts.
              </p>
            </div>
          </div>
        ) : (
          /* Manual Entry Form Screen */
          <form onSubmit={handleSubmitOrder} className="p-5 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
            
            {/* Order Primary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">PO Number <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-blue-600 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Delivery Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  required
                  value={targetDeliveryDate}
                  onChange={(e) => setTargetDeliveryDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Client Directory Selection Section */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Select Client from Directory</span>
                </label>
                <span className="text-[11px] font-medium text-slate-500">
                  Prevents misspelled client names
                </span>
              </div>

              {/* Client Dropdown */}
              <select
                value={selectedClientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              >
                {state.clients.map((cli) => (
                  <option key={cli.id} value={cli.id}>
                    {cli.name} — 📞 {cli.phone} ({cli.companyName || cli.email})
                  </option>
                ))}
                <option value="custom">+ Create / Enter Custom Client...</option>
              </select>

              {/* Client Details Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Hotel Group"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <span>Phone Number</span>
                    <span className="text-[9px] text-blue-600 bg-blue-50 px-1 rounded">Differentiator</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +1 (555) 019-2831"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-blue-700 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. orders@apexhotel.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Delivery Address Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Delivery Address <span className="font-normal text-slate-400">(Optional destination address)</span></span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 742 Evergreen Terrace, Logistics Bay 4, Chicago, IL 60607"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Line Items Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-blue-600" />
                  Select Ordered Products or Components:
                </h4>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddItem('PRODUCT')}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 font-bold cursor-pointer transition-colors"
                  >
                    + Add Finished Goods
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddItem('COMPONENT')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-200 font-bold cursor-pointer transition-colors"
                  >
                    + Add Direct Component
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200/90 rounded-xl overflow-hidden bg-slate-50 p-2 space-y-2">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 pt-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                    <div className="flex-1">
                      <select
                        value={item.id}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          if (item.type === 'PRODUCT') {
                            const p = state.products.find((prod) => prod.id === selectedId);
                            if (p) {
                              const updated = [...orderItems];
                              updated[idx] = { ...item, id: p.id, code: p.sku, name: p.name, unitPrice: p.unitPrice };
                              setOrderItems(updated);
                            }
                          } else {
                            const c = state.components.find((comp) => comp.id === selectedId);
                            if (c) {
                              const updated = [...orderItems];
                              updated[idx] = { ...item, id: c.id, code: c.partCode, name: c.name, unitPrice: c.directPrice || 5.00 };
                              setOrderItems(updated);
                            }
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        {item.type === 'PRODUCT'
                          ? state.products.map((p) => (
                              <option key={p.id} value={p.id}>
                                [PRODUCT] {p.name} ({p.sku}) - ${p.unitPrice}
                              </option>
                            ))
                          : state.components.map((c) => (
                              <option key={c.id} value={c.id}>
                                [COMPONENT] {c.name} ({c.partCode}) - ${c.directPrice || 5.0}
                              </option>
                            ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...orderItems];
                          updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                          setOrderItems(updated);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-900 font-mono text-center font-bold focus:bg-white"
                      />
                    </div>

                    <div className="w-24 text-right font-mono font-bold text-emerald-600">
                      ${(item.quantity * item.unitPrice).toLocaleString()}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove line item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AUTOMATED BOM EXPLOSION PREVIEW */}
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-900 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                  Automated BOM Explosion Preview (Sub-Components Required):
                </h4>
                <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                  {Object.keys(componentRequirements).length} Unique Sub-Parts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.keys(componentRequirements).map((compId) => {
                  const req = componentRequirements[compId];
                  const hasEnoughStock = req.stockAvailable >= req.totalRequired;

                  return (
                    <div
                      key={compId}
                      className="bg-white border border-amber-200/90 rounded-lg p-2.5 text-xs flex items-center justify-between shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 leading-tight">{req.compName}</div>
                        <div className="font-mono text-[10px] text-blue-600 font-bold mt-0.5">{req.partCode}</div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="font-bold text-amber-900">{req.totalRequired} Required</div>
                        <div className={`text-[10px] font-bold ${hasEnoughStock ? 'text-emerald-600' : 'text-amber-700'}`}>
                          {hasEnoughStock ? `In Stock: ${req.stockAvailable}` : `Needs Production`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total & Submit */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-500 font-medium">Total Purchase Order Value: </span>
                <span className="font-bold text-emerald-600 font-mono text-base">${totalAmount.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Launch Purchase Order & Work Orders</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

