export type ItemCategory = 
  | 'Lever Handles'
  | 'Pull Handles'
  | 'Mortise Locks'
  | 'Hinges'
  | 'Cabinet Knobs'
  | 'Cylinders & Accessories';

export type MaterialType =
  | 'Solid Brass'
  | 'Stainless Steel 304'
  | 'Zinc Alloy'
  | 'Aluminium'
  | 'Mild Steel'
  | 'Nylon/Polymer';

export type HardwareFinish =
  | 'Satin Brass'
  | 'Antique Bronze'
  | 'Matt Black'
  | 'Satin Chrome'
  | 'Polished Chrome'
  | 'Rose Gold PVD'
  | 'Raw Metal / Unfinished';

export interface BomItem {
  componentId: string;
  qtyRequiredPerUnit: number;
}

// Finished Product
export interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  category: ItemCategory;
  description: string;
  unitPrice: number;
  unitCost: number;
  stockQty: number;
  reorderPoint: number;
  leadTimeDays: number;
  defaultFinish: HardwareFinish;
  bom: BomItem[];
  imageUrl?: string;
}

// Component / Part
export interface InventoryComponent {
  id: string;
  partCode: string;
  name: string;
  material: MaterialType;
  dimensions: string;
  supplier: string;
  description: string;
  stockQty: number;
  reorderPoint: number;
  unitCost: number;
  defaultFinish: HardwareFinish;
  canSellDirectly: boolean; // Buyers can buy components directly
  directPrice?: number;
  parentProductIds: string[]; // Products where this part is used
  imageUrl?: string;
}

// User Roles & Custom RBAC System
export type ErpTabId = 
  | 'dashboard'
  | 'products'
  | 'components'
  | 'kanban'
  | 'orders'
  | 'matrix'
  | 'terminal'
  | 'qc'
  | 'users'
  | 'clients';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'QC' | string;

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  isSystemRole?: boolean;
  roleBadgeColor?: string;
  allowedTabs: ErpTabId[];
}

export interface ErpUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatarUrl?: string;
  customAllowedTabs?: ErpTabId[];
}

// The 12 Stages of Production Flow
export type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface StageDefinition {
  id: StageId;
  name: string;
  shortName: string;
  description: string;
  department: string;
  isQcStage: boolean;
}

export const PRODUCTION_STAGES: StageDefinition[] = [
  { id: 1, name: 'Forecasting & Planning', shortName: 'Forecasting', description: 'Material requirements planning & scheduling', department: 'PPC Office', isQcStage: false },
  { id: 2, name: 'Stock Availability Check', shortName: 'Stock Check', description: 'Reserving ready raw material and stock components', department: 'Warehouse', isQcStage: false },
  { id: 3, name: 'Operation Section', shortName: 'Operation', description: 'Casting, Forging, Stamping & CNC Machining', department: 'Machine Shop', isQcStage: false },
  { id: 4, name: 'Quality Check #1 (In-Process)', shortName: 'QC #1 (Machining)', description: 'Dimensional & structural defect inspection', department: 'QA Line 1', isQcStage: true },
  { id: 5, name: 'Polishing & Surface Prep', shortName: 'Polishing', description: 'Belt grinding, mirror buffing, deburring per part specs', department: 'Polishing Shop', isQcStage: false },
  { id: 6, name: 'Quality Check #2 (Surface)', shortName: 'QC #2 (Surface)', description: 'Surface smoothness & scratch inspection', department: 'QA Line 2', isQcStage: true },
  { id: 7, name: 'Finishing & Electroplating', shortName: 'Finishing', description: 'Plating, PVD coating, Powder coating, Lacquering', department: 'Plating Shop', isQcStage: false },
  { id: 8, name: 'Quality Check #3 (Plating QC)', shortName: 'QC #3 (Plating)', description: 'Plating thickness, salt-spray & color match check', department: 'QA Line 3', isQcStage: true },
  { id: 9, name: 'Final Inspection', shortName: 'Final Inspection', description: 'Pre-assembly component count & batch QA audit', department: 'Final QA', isQcStage: true },
  { id: 10, name: 'Assembly of Parts', shortName: 'Assembly', description: 'Assembling sub-parts (springs, roses, levers) into sets', department: 'Assembly Bay', isQcStage: false },
  { id: 11, name: 'Packing & Barcoding', shortName: 'Packing', description: 'Inner unit boxing, accessories kitting & outer master cartons', department: 'Packing Bay', isQcStage: false },
  { id: 12, name: 'Dispatch & Shipping', shortName: 'Dispatch', description: 'Outward log, gate pass & logistics manifest generation', department: 'Logistics', isQcStage: false },
];

export interface StageProgress {
  stageId: StageId;
  completedQty: number;
  passedQC: number;
  defectQty: number;
  defectNotes?: string;
  updatedAt: string;
}

export interface PartWorkOrder {
  id: string;
  poId: string;
  componentId: string;
  partCode: string;
  partName: string;
  totalRequired: number;
  currentStage: StageId;
  stageProgress: Record<StageId, StageProgress>;
  status: 'Pending' | 'In Progress' | 'QC Flagged' | 'Ready for Assembly' | 'Completed';
  bottleneckAlert?: string;
}

export interface OrderItem {
  type: 'PRODUCT' | 'COMPONENT';
  id: string; // Product or Component ID
  code: string; // SKU or Part Code
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface QcLog {
  id: string;
  poNumber: string;
  partCode: string;
  partName: string;
  stageId: StageId;
  inspectorName: string;
  passedCount: number;
  defectCount: number;
  defectReason: string;
  timestamp: string;
}

export interface Client {
  id: string;
  name: string;
  companyName?: string;
  phone: string;
  email: string;
  deliveryAddress?: string; // Optional delivery address
  taxId?: string;
  contactPerson?: string;
  notes?: string;
  createdAt?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  deliveryAddress?: string;
  orderDate: string;
  targetDeliveryDate: string;
  items: OrderItem[];
  totalAmount: number;
  overallStatus: 'Forecasting' | 'In Production' | 'Assembly Ready' | 'Packing' | 'Dispatched';
  partWorkOrders: PartWorkOrder[];
  notes?: string;
  priority: 'Normal' | 'Urgent' | 'High Priority';
}

export interface ErpDataState {
  products: InventoryProduct[];
  components: InventoryComponent[];
  purchaseOrders: PurchaseOrder[];
  qcLogs: QcLog[];
  clients: Client[];
  users?: ErpUser[];
  roles?: RoleDefinition[];
}
