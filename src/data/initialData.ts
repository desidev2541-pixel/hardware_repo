import {
  ErpDataState,
  InventoryComponent,
  InventoryProduct,
  PurchaseOrder,
  QcLog,
  ErpUser,
  Client,
  RoleDefinition
} from '../types/erp';
import { INITIAL_ROLES } from '../utils/rbac';

export const initialUsers: ErpUser[] = [
  {
    id: 'usr-0',
    name: 'Dev System Architect',
    email: 'superadmin@forgetrack.io',
    role: 'SUPER_ADMIN',
    title: 'Software Developer & Platform Maintainer',
  },
  {
    id: 'usr-1',
    name: 'Factory Owner (Admin)',
    email: 'admin@handleworks.com',
    role: 'ADMIN',
    title: 'Factory Owner & Managing Director',
  },
  {
    id: 'usr-2',
    name: 'Production Manager',
    email: 'manager@handleworks.com',
    role: 'MANAGER',
    title: 'Shop Floor Manager',
  },
  {
    id: 'usr-3',
    name: 'Polishing Section Head',
    email: 'polishing@handleworks.com',
    role: 'Polishing Manager',
    title: 'Polishing Bay Operational Lead',
  },
  {
    id: 'usr-4',
    name: 'Line Supervisor',
    email: 'supervisor@handleworks.com',
    role: 'SUPERVISOR',
    title: 'Machining Shift Lead',
  },
  {
    id: 'usr-5',
    name: 'QC Inspector',
    email: 'qc@handleworks.com',
    role: 'QC',
    title: 'Lead QA Auditor',
  },
];

export const initialComponents: InventoryComponent[] = [
  {
    id: 'cmp-1',
    partCode: 'CMP-LVR-01',
    name: 'Solid Brass Curved Lever Arm (Right)',
    material: 'Solid Brass',
    dimensions: '135mm x 22mm x 12mm',
    supplier: 'Apex Brass Foundry Ltd',
    description: 'Forged solid brass ergonomic right-hand lever handle blade',
    stockQty: 450,
    reorderPoint: 200,
    unitCost: 8.50,
    defaultFinish: 'Satin Brass',
    canSellDirectly: true,
    directPrice: 16.00,
    parentProductIds: ['prd-1', 'prd-2'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cmp-2',
    partCode: 'CMP-LVR-02',
    name: 'Solid Brass Curved Lever Arm (Left)',
    material: 'Solid Brass',
    dimensions: '135mm x 22mm x 12mm',
    supplier: 'Apex Brass Foundry Ltd',
    description: 'Forged solid brass ergonomic left-hand lever handle blade',
    stockQty: 410,
    reorderPoint: 200,
    unitCost: 8.50,
    defaultFinish: 'Satin Brass',
    canSellDirectly: true,
    directPrice: 16.00,
    parentProductIds: ['prd-1', 'prd-2'],
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cmp-3',
    partCode: 'CMP-ROS-01',
    name: 'Round Brass Mounting Rose Outer Cap (53mm)',
    material: 'Solid Brass',
    dimensions: '53mm Dia x 10mm Depth',
    supplier: 'Apex Brass Foundry Ltd',
    description: 'Decorative brass cover rose plate for door handle base',
    stockQty: 850,
    reorderPoint: 400,
    unitCost: 3.20,
    defaultFinish: 'Satin Brass',
    canSellDirectly: true,
    directPrice: 7.50,
    parentProductIds: ['prd-1'],
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cmp-4',
    partCode: 'CMP-ROS-02',
    name: 'Zinc Escutcheon Internal Sub-Base Plate',
    material: 'Zinc Alloy',
    dimensions: '50mm Dia x 6mm Thickness',
    supplier: 'Precision Stamping Corp',
    description: 'Structural inner base mounting plate with screw holes',
    stockQty: 1200,
    reorderPoint: 500,
    unitCost: 1.40,
    defaultFinish: 'Raw Metal / Unfinished',
    canSellDirectly: false,
    parentProductIds: ['prd-1', 'prd-2'],
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cmp-5',
    partCode: 'CMP-SPD-01',
    name: 'Solid Steel Square Spindle Bar (8x8x100mm)',
    material: 'Mild Steel',
    dimensions: '8mm x 8mm x 100mm',
    supplier: 'Global Hardware Alloys',
    description: 'Hardened square drive spindle bar for latch engagement',
    stockQty: 2400,
    reorderPoint: 600,
    unitCost: 0.90,
    defaultFinish: 'Satin Chrome',
    canSellDirectly: true,
    directPrice: 2.50,
    parentProductIds: ['prd-1', 'prd-2', 'prd-3'],
    imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cmp-6',
    partCode: 'CMP-GRB-01',
    name: 'M4 x 8 Stainless Steel Hex Grub Screw',
    material: 'Stainless Steel 304',
    dimensions: 'M4 x 8mm Thread',
    supplier: 'Apex Fasteners Inc',
    description: 'Precision grub screw for locking lever onto spindle',
    stockQty: 5000,
    reorderPoint: 1500,
    unitCost: 0.15,
    defaultFinish: 'Raw Metal / Unfinished',
    canSellDirectly: true,
    directPrice: 0.50,
    parentProductIds: ['prd-1', 'prd-2', 'prd-4'],
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cmp-7',
    partCode: 'CMP-SPR-01',
    name: 'Heavy Duty Tempered Coil Return Spring',
    material: 'Mild Steel',
    dimensions: '28mm Outer Dia x 3mm Wire',
    supplier: 'Precision Stamping Corp',
    description: 'Internal spring mechanism for handle self-return action',
    stockQty: 1800,
    reorderPoint: 500,
    unitCost: 0.45,
    defaultFinish: 'Raw Metal / Unfinished',
    canSellDirectly: true,
    directPrice: 1.20,
    parentProductIds: ['prd-1', 'prd-2'],
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cmp-8',
    partCode: 'CMP-WSH-01',
    name: 'Nylon Low-Friction Glide Washer (18mm)',
    material: 'Nylon/Polymer',
    dimensions: '18mm Outer Dia x 10mm Inner Dia',
    supplier: 'Polymer Tech Products',
    description: 'Smooth rotation anti-friction nylon ring',
    stockQty: 3500,
    reorderPoint: 1000,
    unitCost: 0.08,
    defaultFinish: 'Raw Metal / Unfinished',
    canSellDirectly: true,
    directPrice: 0.30,
    parentProductIds: ['prd-1', 'prd-2', 'prd-4'],
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cmp-9',
    partCode: 'CMP-FIX-01',
    name: 'M4 Through-Fixing Threaded Bolt Pair Set',
    material: 'Stainless Steel 304',
    dimensions: 'M4 x 60mm Bolt Set',
    supplier: 'Apex Fasteners Inc',
    description: 'Dual bolt and sleeve set for door bolt-through installation',
    stockQty: 1600,
    reorderPoint: 500,
    unitCost: 0.60,
    defaultFinish: 'Satin Chrome',
    canSellDirectly: true,
    directPrice: 1.80,
    parentProductIds: ['prd-1', 'prd-2', 'prd-3'],
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cmp-10',
    partCode: 'CMP-KEY-01',
    name: '3mm Hex Allen Key Wrench',
    material: 'Mild Steel',
    dimensions: '3mm Hex x 65mm L-Key',
    supplier: 'Apex Fasteners Inc',
    description: 'Installation Allen key for grub screw tightening',
    stockQty: 2100,
    reorderPoint: 500,
    unitCost: 0.20,
    defaultFinish: 'Raw Metal / Unfinished',
    canSellDirectly: true,
    directPrice: 0.80,
    parentProductIds: ['prd-1', 'prd-2'],
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cmp-11',
    partCode: 'CMP-LCK-01',
    name: 'Brass Mortise Latch Deadbolt Mechanism',
    material: 'Solid Brass',
    dimensions: '85mm x 165mm x 60mm Backset',
    supplier: 'Apex Brass Foundry Ltd',
    description: '60mm backset heavy duty internal mortise lock body',
    stockQty: 320,
    reorderPoint: 100,
    unitCost: 14.20,
    defaultFinish: 'Satin Brass',
    canSellDirectly: true,
    directPrice: 29.00,
    parentProductIds: ['prd-3'],
    imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cmp-12',
    partCode: 'CMP-CYL-01',
    name: 'Euro Profile Brass Pin Tumbler Cylinder Core',
    material: 'Solid Brass',
    dimensions: '70mm Euro Profile (35/35)',
    supplier: 'Global Hardware Alloys',
    description: '70mm Euro profile double cylinder lock core with 3 brass keys',
    stockQty: 280,
    reorderPoint: 100,
    unitCost: 12.50,
    defaultFinish: 'Satin Brass',
    canSellDirectly: true,
    directPrice: 26.00,
    parentProductIds: ['prd-3'],
    imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cmp-13',
    partCode: 'CMP-KNB-01',
    name: 'Solid Brass Knurled Cabinet Knob Head',
    material: 'Solid Brass',
    dimensions: '30mm Dia x 28mm Height',
    supplier: 'Apex Brass Foundry Ltd',
    description: '30mm diamond knurled solid brass architectural cabinet knob',
    stockQty: 620,
    reorderPoint: 250,
    unitCost: 4.10,
    defaultFinish: 'Satin Brass',
    canSellDirectly: true,
    directPrice: 9.50,
    parentProductIds: ['prd-4'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cmp-14',
    partCode: 'CMP-KNB-BS',
    name: 'M4 Threaded Brass Knob Stem Base',
    material: 'Solid Brass',
    dimensions: '16mm Dia x 12mm Base Collar',
    supplier: 'Apex Brass Foundry Ltd',
    description: 'Threaded base collar for architectural cabinet knobs',
    stockQty: 800,
    reorderPoint: 300,
    unitCost: 1.80,
    defaultFinish: 'Satin Brass',
    canSellDirectly: true,
    directPrice: 4.00,
    parentProductIds: ['prd-4'],
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'
  }
];

export const initialProducts: InventoryProduct[] = [
  {
    id: 'prd-1',
    sku: 'PRD-H101',
    name: 'Royal Monarch Solid Brass Lever Handle Set',
    category: 'Lever Handles',
    description: 'Premium architectural curved brass lever handle set with rose plate and accessories (Consists of 10 parts).',
    unitPrice: 68.00,
    unitCost: 28.50,
    stockQty: 180,
    reorderPoint: 50,
    leadTimeDays: 14,
    defaultFinish: 'Satin Brass',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
    bom: [
      { componentId: 'cmp-1', qtyRequiredPerUnit: 1 }, // Lever Right
      { componentId: 'cmp-2', qtyRequiredPerUnit: 1 }, // Lever Left
      { componentId: 'cmp-3', qtyRequiredPerUnit: 2 }, // Rose Outer Cap x2
      { componentId: 'cmp-4', qtyRequiredPerUnit: 2 }, // Rose Sub-Base Plate x2
      { componentId: 'cmp-5', qtyRequiredPerUnit: 1 }, // Spindle Bar
      { componentId: 'cmp-6', qtyRequiredPerUnit: 2 }, // Grub Screws x2
      { componentId: 'cmp-7', qtyRequiredPerUnit: 2 }, // Coil Springs x2
      { componentId: 'cmp-8', qtyRequiredPerUnit: 2 }, // Nylon Washers x2
      { componentId: 'cmp-9', qtyRequiredPerUnit: 2 }, // Through-Fixing Bolts x2
      { componentId: 'cmp-10', qtyRequiredPerUnit: 1 }, // Allen Wrench
    ]
  },
  {
    id: 'prd-2',
    sku: 'PRD-H205',
    name: 'Aura Modern Square Rose Matt Black Handle Set',
    category: 'Lever Handles',
    description: 'Contemporary square profile door handle in electroplated Matt Black finish (Consists of 9 parts).',
    unitPrice: 59.00,
    unitCost: 24.00,
    stockQty: 95,
    reorderPoint: 40,
    leadTimeDays: 12,
    defaultFinish: 'Matt Black',
    imageUrl: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?auto=format&fit=crop&w=600&q=80',
    bom: [
      { componentId: 'cmp-1', qtyRequiredPerUnit: 1 },
      { componentId: 'cmp-2', qtyRequiredPerUnit: 1 },
      { componentId: 'cmp-4', qtyRequiredPerUnit: 2 },
      { componentId: 'cmp-5', qtyRequiredPerUnit: 1 },
      { componentId: 'cmp-6', qtyRequiredPerUnit: 2 },
      { componentId: 'cmp-7', qtyRequiredPerUnit: 2 },
      { componentId: 'cmp-8', qtyRequiredPerUnit: 2 },
      { componentId: 'cmp-9', qtyRequiredPerUnit: 2 },
      { componentId: 'cmp-10', qtyRequiredPerUnit: 1 },
    ]
  },
  {
    id: 'prd-3',
    sku: 'PRD-L800',
    name: 'Precision Brass Mortise Lock & Euro Cylinder Combo',
    category: 'Mortise Locks',
    description: 'Complete high-security mortise latch and key cylinder system.',
    unitPrice: 85.00,
    unitCost: 38.00,
    stockQty: 60,
    reorderPoint: 30,
    leadTimeDays: 10,
    defaultFinish: 'Satin Brass',
    imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    bom: [
      { componentId: 'cmp-5', qtyRequiredPerUnit: 1 },
      { componentId: 'cmp-9', qtyRequiredPerUnit: 2 },
      { componentId: 'cmp-11', qtyRequiredPerUnit: 1 }, // Latch
      { componentId: 'cmp-12', qtyRequiredPerUnit: 1 }, // Cylinder
    ]
  },
  {
    id: 'prd-4',
    sku: 'PRD-K040',
    name: 'Classic Knurled Architectural Brass Cabinet Knob',
    category: 'Cabinet Knobs',
    description: 'Luxury tactile knurled cabinet knob for kitchen & wardrobe cabinetry.',
    unitPrice: 18.50,
    unitCost: 7.20,
    stockQty: 340,
    reorderPoint: 100,
    leadTimeDays: 7,
    defaultFinish: 'Satin Brass',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    bom: [
      { componentId: 'cmp-13', qtyRequiredPerUnit: 1 }, // Knob head
      { componentId: 'cmp-14', qtyRequiredPerUnit: 1 }, // Base collar
      { componentId: 'cmp-6', qtyRequiredPerUnit: 1 },  // Set screw
    ]
  }
];

// Pre-constructed Sample Purchase Orders showcasing part-level tracking
export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-101',
    poNumber: 'PO-2026-088',
    clientName: 'Apex Luxury Hotels & Resorts',
    clientEmail: 'procurement@apexluxury.com',
    orderDate: '2026-07-20',
    targetDeliveryDate: '2026-08-15',
    totalAmount: 34500.00,
    overallStatus: 'In Production',
    priority: 'Urgent',
    notes: 'Order for 500 sets of Royal Monarch Brass Handle PRD-H101 + 200 spare Spindles. Custom Satin Brass PVD Finish required.',
    items: [
      { type: 'PRODUCT', id: 'prd-1', code: 'PRD-H101', name: 'Royal Monarch Solid Brass Lever Handle Set', quantity: 500, unitPrice: 68.00 },
      { type: 'COMPONENT', id: 'cmp-5', code: 'CMP-SPD-01', name: 'Solid Steel Square Spindle Bar (8x8x100mm)', quantity: 200, unitPrice: 2.50 }
    ],
    partWorkOrders: [
      {
        id: 'pwo-101-1',
        poId: 'po-101',
        componentId: 'cmp-1',
        partCode: 'CMP-LVR-01',
        partName: 'Solid Brass Curved Lever Arm (Right)',
        totalRequired: 500,
        currentStage: 5, // Polishing
        status: 'In Progress',
        stageProgress: {
          1: { stageId: 1, completedQty: 500, passedQC: 500, defectQty: 0, updatedAt: '2026-07-21' },
          2: { stageId: 2, completedQty: 500, passedQC: 500, defectQty: 0, updatedAt: '2026-07-22' },
          3: { stageId: 3, completedQty: 500, passedQC: 490, defectQty: 10, defectNotes: 'Porosity in casting', updatedAt: '2026-07-24' },
          4: { stageId: 4, completedQty: 490, passedQC: 490, defectQty: 0, updatedAt: '2026-07-25' },
          5: { stageId: 5, completedQty: 420, passedQC: 410, defectQty: 10, defectNotes: 'Minor scratches after belt buffing', updatedAt: '2026-07-28' },
          6: { stageId: 6, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          7: { stageId: 7, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          8: { stageId: 8, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          9: { stageId: 9, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          10: { stageId: 10, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          11: { stageId: 11, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          12: { stageId: 12, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
        }
      },
      {
        id: 'pwo-101-2',
        poId: 'po-101',
        componentId: 'cmp-2',
        partCode: 'CMP-LVR-02',
        partName: 'Solid Brass Curved Lever Arm (Left)',
        totalRequired: 500,
        currentStage: 5, // Polishing
        status: 'In Progress',
        stageProgress: {
          1: { stageId: 1, completedQty: 500, passedQC: 500, defectQty: 0, updatedAt: '2026-07-21' },
          2: { stageId: 2, completedQty: 500, passedQC: 500, defectQty: 0, updatedAt: '2026-07-22' },
          3: { stageId: 3, completedQty: 500, passedQC: 495, defectQty: 5, updatedAt: '2026-07-24' },
          4: { stageId: 4, completedQty: 495, passedQC: 495, defectQty: 0, updatedAt: '2026-07-25' },
          5: { stageId: 5, completedQty: 400, passedQC: 395, defectQty: 5, updatedAt: '2026-07-28' },
          6: { stageId: 6, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          7: { stageId: 7, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          8: { stageId: 8, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          9: { stageId: 9, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          10: { stageId: 10, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          11: { stageId: 11, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          12: { stageId: 12, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
        }
      },
      {
        id: 'pwo-101-3',
        poId: 'po-101',
        componentId: 'cmp-3',
        partCode: 'CMP-ROS-01',
        partName: 'Round Brass Mounting Rose Outer Cap (53mm)',
        totalRequired: 1000,
        currentStage: 7, // Electroplating / Finishing
        status: 'QC Flagged',
        bottleneckAlert: 'BOTTLENECK: Electroplating Tank #2 delay. Plating thickness inconsistent in last batch.',
        stageProgress: {
          1: { stageId: 1, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-21' },
          2: { stageId: 2, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-22' },
          3: { stageId: 3, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-23' },
          4: { stageId: 4, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-24' },
          5: { stageId: 5, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-26' },
          6: { stageId: 6, completedQty: 1000, passedQC: 980, defectQty: 20, defectNotes: 'Edge roughness cleaned', updatedAt: '2026-07-27' },
          7: { stageId: 7, completedQty: 600, passedQC: 550, defectQty: 50, defectNotes: 'Satin Brass plating tone variance', updatedAt: '2026-07-29' },
          8: { stageId: 8, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          9: { stageId: 9, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          10: { stageId: 10, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          11: { stageId: 11, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          12: { stageId: 12, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
        }
      },
      {
        id: 'pwo-101-4',
        poId: 'po-101',
        componentId: 'cmp-4',
        partCode: 'CMP-ROS-02',
        partName: 'Zinc Escutcheon Internal Sub-Base Plate',
        totalRequired: 1000,
        currentStage: 9, // Final Inspection
        status: 'Ready for Assembly',
        stageProgress: {
          1: { stageId: 1, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-21' },
          2: { stageId: 2, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-22' },
          3: { stageId: 3, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-23' },
          4: { stageId: 4, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-24' },
          5: { stageId: 5, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-25' },
          6: { stageId: 6, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-26' },
          7: { stageId: 7, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-27' },
          8: { stageId: 8, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-28' },
          9: { stageId: 9, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-29' },
          10: { stageId: 10, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          11: { stageId: 11, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          12: { stageId: 12, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
        }
      },
      {
        id: 'pwo-101-5',
        poId: 'po-101',
        componentId: 'cmp-5',
        partCode: 'CMP-SPD-01',
        partName: 'Solid Steel Square Spindle Bar (8x8x100mm)',
        totalRequired: 700, // 500 for handle + 200 direct sale
        currentStage: 9, // Final Inspection
        status: 'Ready for Assembly',
        stageProgress: {
          1: { stageId: 1, completedQty: 700, passedQC: 700, defectQty: 0, updatedAt: '2026-07-21' },
          2: { stageId: 2, completedQty: 700, passedQC: 700, defectQty: 0, updatedAt: '2026-07-21' },
          3: { stageId: 3, completedQty: 700, passedQC: 700, defectQty: 0, updatedAt: '2026-07-22' },
          4: { stageId: 4, completedQty: 700, passedQC: 700, defectQty: 0, updatedAt: '2026-07-23' },
          5: { stageId: 5, completedQty: 700, passedQC: 700, defectQty: 0, updatedAt: '2026-07-24' },
          6: { stageId: 6, completedQty: 700, passedQC: 700, defectQty: 0, updatedAt: '2026-07-25' },
          7: { stageId: 7, completedQty: 700, passedQC: 700, defectQty: 0, updatedAt: '2026-07-26' },
          8: { stageId: 8, completedQty: 700, passedQC: 700, defectQty: 0, updatedAt: '2026-07-27' },
          9: { stageId: 9, completedQty: 700, passedQC: 700, defectQty: 0, updatedAt: '2026-07-28' },
          10: { stageId: 10, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          11: { stageId: 11, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          12: { stageId: 12, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
        }
      },
      {
        id: 'pwo-101-6',
        poId: 'po-101',
        componentId: 'cmp-6',
        partCode: 'CMP-GRB-01',
        partName: 'M4 x 8 Stainless Steel Hex Grub Screw',
        totalRequired: 1000,
        currentStage: 9,
        status: 'Ready for Assembly',
        stageProgress: {
          1: { stageId: 1, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-21' },
          2: { stageId: 2, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-21' },
          3: { stageId: 3, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-21' },
          4: { stageId: 4, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-21' },
          5: { stageId: 5, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-21' },
          6: { stageId: 6, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-21' },
          7: { stageId: 7, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-21' },
          8: { stageId: 8, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-21' },
          9: { stageId: 9, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-21' },
          10: { stageId: 10, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          11: { stageId: 11, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          12: { stageId: 12, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
        }
      },
      {
        id: 'pwo-101-7',
        poId: 'po-101',
        componentId: 'cmp-7',
        partCode: 'CMP-SPR-01',
        partName: 'Heavy Duty Tempered Coil Return Spring',
        totalRequired: 1000,
        currentStage: 9,
        status: 'Ready for Assembly',
        stageProgress: {
          1: { stageId: 1, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-21' },
          2: { stageId: 2, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-21' },
          3: { stageId: 3, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-22' },
          4: { stageId: 4, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-23' },
          5: { stageId: 5, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-24' },
          6: { stageId: 6, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-25' },
          7: { stageId: 7, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-26' },
          8: { stageId: 8, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-27' },
          9: { stageId: 9, completedQty: 1000, passedQC: 1000, defectQty: 0, updatedAt: '2026-07-28' },
          10: { stageId: 10, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          11: { stageId: 11, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          12: { stageId: 12, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
        }
      }
    ]
  },
  {
    id: 'po-102',
    poNumber: 'PO-2026-092',
    clientName: 'EuroHardware Distributors Ltd',
    clientEmail: 'orders@eurohardware.co.uk',
    orderDate: '2026-07-25',
    targetDeliveryDate: '2026-08-20',
    totalAmount: 11800.00,
    overallStatus: 'Forecasting',
    priority: 'Normal',
    notes: '200 sets of Aura Modern Matt Black handle PRD-H205.',
    items: [
      { type: 'PRODUCT', id: 'prd-2', code: 'PRD-H205', name: 'Aura Modern Square Rose Matt Black Handle Set', quantity: 200, unitPrice: 59.00 }
    ],
    partWorkOrders: [
      {
        id: 'pwo-102-1',
        poId: 'po-102',
        componentId: 'cmp-1',
        partCode: 'CMP-LVR-01',
        partName: 'Solid Brass Curved Lever Arm (Right)',
        totalRequired: 200,
        currentStage: 2, // Stock Check
        status: 'In Progress',
        stageProgress: {
          1: { stageId: 1, completedQty: 200, passedQC: 200, defectQty: 0, updatedAt: '2026-07-26' },
          2: { stageId: 2, completedQty: 200, passedQC: 200, defectQty: 0, updatedAt: '2026-07-27' },
          3: { stageId: 3, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          4: { stageId: 4, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          5: { stageId: 5, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          6: { stageId: 6, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          7: { stageId: 7, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          8: { stageId: 8, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          9: { stageId: 9, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          10: { stageId: 10, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          11: { stageId: 11, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          12: { stageId: 12, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
        }
      }
    ]
  },
  {
    id: 'po-103',
    poNumber: 'PO-2026-095',
    clientName: 'Direct Hardware Wholesalers',
    clientEmail: 'supply@directhardware.com',
    orderDate: '2026-07-28',
    targetDeliveryDate: '2026-08-10',
    totalAmount: 7250.00,
    overallStatus: 'In Production',
    priority: 'High Priority',
    notes: 'Direct component order: 1000 Spindles + 500 Knurled Cabinet Knobs.',
    items: [
      { type: 'COMPONENT', id: 'cmp-5', code: 'CMP-SPD-01', name: 'Solid Steel Square Spindle Bar', quantity: 1000, unitPrice: 2.50 },
      { type: 'COMPONENT', id: 'cmp-13', code: 'CMP-KNB-01', name: 'Solid Brass Knurled Cabinet Knob Head', quantity: 500, unitPrice: 9.50 }
    ],
    partWorkOrders: [
      {
        id: 'pwo-103-1',
        poId: 'po-103',
        componentId: 'cmp-13',
        partCode: 'CMP-KNB-01',
        partName: 'Solid Brass Knurled Cabinet Knob Head',
        totalRequired: 500,
        currentStage: 3, // CNC Machining
        status: 'In Progress',
        stageProgress: {
          1: { stageId: 1, completedQty: 500, passedQC: 500, defectQty: 0, updatedAt: '2026-07-28' },
          2: { stageId: 2, completedQty: 500, passedQC: 500, defectQty: 0, updatedAt: '2026-07-29' },
          3: { stageId: 3, completedQty: 350, passedQC: 345, defectQty: 5, updatedAt: '2026-07-29' },
          4: { stageId: 4, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          5: { stageId: 5, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          6: { stageId: 6, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          7: { stageId: 7, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          8: { stageId: 8, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          9: { stageId: 9, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          10: { stageId: 10, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          11: { stageId: 11, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
          12: { stageId: 12, completedQty: 0, passedQC: 0, defectQty: 0, updatedAt: '' },
        }
      }
    ]
  }
];

export const initialQcLogs: QcLog[] = [
  {
    id: 'qc-log-1',
    poNumber: 'PO-2026-088',
    partCode: 'CMP-ROS-01',
    partName: 'Round Brass Mounting Rose Outer Cap',
    stageId: 7,
    inspectorName: 'Inspector Rajesh Kumar',
    passedCount: 550,
    defectCount: 50,
    defectReason: 'Plating tone variance in Satin Brass bath tank #2',
    timestamp: '2026-07-29 14:30'
  },
  {
    id: 'qc-log-2',
    poNumber: 'PO-2026-088',
    partCode: 'CMP-LVR-01',
    partName: 'Solid Brass Curved Lever Arm (Right)',
    stageId: 3,
    inspectorName: 'Inspector Vikram Singh',
    passedCount: 490,
    defectCount: 10,
    defectReason: 'Porosity in die casting core',
    timestamp: '2026-07-24 11:15'
  }
];

export const initialClients: Client[] = [
  {
    id: 'cli-1',
    name: 'Apex Hotel Group',
    companyName: 'Apex Hospitality Corp (Midwest HQ)',
    phone: '+1 (555) 019-2831',
    email: 'orders@apexhotel.com',
    deliveryAddress: '742 Evergreen Terrace, Logistics Bay 4, Chicago, IL 60607',
    taxId: 'US-982341201',
    contactPerson: 'Sarah Jenkins (Procurement Mgr)',
    notes: 'Requires Satin Brass PVD Finish for all hospitality door hardware orders.',
    createdAt: '2026-01-15'
  },
  {
    id: 'cli-2',
    name: 'EuroHardware Distributors Ltd',
    companyName: 'EuroHardware UK Holding',
    phone: '+44 20 7946 0912',
    email: 'orders@eurohardware.co.uk',
    deliveryAddress: 'Unit 12, Heathrow Cargo Hub, Hounslow, London TW6 3UA, UK',
    taxId: 'GB-334129088',
    contactPerson: 'David Miller',
    notes: 'International freight forwarder delivery. Palletized packing mandatory.',
    createdAt: '2026-02-10'
  },
  {
    id: 'cli-3',
    name: 'Direct Hardware Wholesalers',
    companyName: 'Direct Hardware Supply LLC',
    phone: '+1 (555) 882-9014',
    email: 'supply@directhardware.com',
    deliveryAddress: '120 West Industrial Parkway, Dock 8, Atlanta, GA 30301',
    taxId: 'US-441098231',
    contactPerson: 'Marcus Vance',
    notes: 'Bulk direct component buyer. Weekly shipping cadence.',
    createdAt: '2026-03-01'
  },
  {
    id: 'cli-4',
    name: 'Apex Hotel Group',
    companyName: 'Apex Hospitality Corp (West Coast Div)',
    phone: '+1 (555) 431-9920',
    email: 'west@apexhotel.com',
    deliveryAddress: '880 Ocean Boulevard, Suite 400, San Francisco, CA 94102',
    taxId: 'US-982341202',
    contactPerson: 'Michael Chang',
    notes: 'West Coast branch. Same client name, but phone number +1 (555) 431-9920 differentiates delivery destination.',
    createdAt: '2026-04-12'
  }
];

export const initialErpState: ErpDataState = {
  products: initialProducts,
  components: initialComponents,
  purchaseOrders: initialPurchaseOrders,
  qcLogs: initialQcLogs,
  clients: initialClients,
  users: initialUsers,
  roles: INITIAL_ROLES,
};
