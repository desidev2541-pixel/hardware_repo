# 🏭 Hardware Factory ERP - Enterprise Manufacturing & Operations Platform

> A comprehensive, full-stack Enterprise Resource Planning (ERP) platform tailored for **Hardware Manufacturing, Architectural Brassware, Electroplating, and Precision Metal Fabrications**.

---

## 🌟 Overview & Key Highlights

**Hardware Factory ERP** provides complete end-to-end operational visibility across the hardware manufacturing lifecycle—from raw brass ingot procurement and sub-component stock management, through a **12-stage shopfloor production pipeline**, to quality assurance, purchase order fulfillment, and client invoicing.

### Key Operational Pillars:
1. **Dual-Inventory Management**: Real-time tracking of both Finished Hardware Goods (Mortise handles, rose sets, tower bolts) and Sub-Components / Raw Materials (Brass CZ121 ingots, zinc die-cast parts, springs, fasteners).
2. **12-Stage Part-Level Shopfloor Kanban**: Tracking batches through melting, casting, machining, polishing, electroplating, lacquering, quality inspection, and packaging.
3. **Quick Production Article Presets**: One-click PO creation with pre-configured Bill of Materials (BOM), unit pricing, electroplating finishes, and default batch quantities.
4. **Defect Tracking & Process Yield Matrix**: Stage-by-stage defect logging with surface finish imperfection categorization (pitting, uneven plating, scratches, dimensional variance).
5. **Granular Role-Based Access Control (RBAC)**: Multi-role user management with section-level permission toggles, title keyword auto-detection, and smart role permission suggestions.
6. **Master Configuration Center**: Dynamic factory settings for finishes, raw materials, units of measure, defect classifications, stations, and immutable audit logging.

---

## 🚀 Complete Feature Breakdown

### 📊 1. Executive Operations Dashboard
- **Real-Time Factory KPIs**: Total active production batches, pending purchase orders, overall stage 1-12 yield percentage, surface defect percentage, and finished goods inventory valuation.
- **Production Stage Pipeline Chart**: Interactive visual breakdown of batch distribution across all 12 manufacturing stages.
- **Stage Bottleneck & Capacity Alerts**: Automatic visual alerts highlighting stages exceeding batch capacity thresholds.
- **Recent Activity Feed**: Real-time log of newly placed purchase orders, completed QC inspections, and inventory updates.
- **Quick Action Shortcuts**: Instant navigation to create purchase orders, launch Kanban batches, or inspect inventory.

---

### 📦 2. Product Catalog & Finished Goods Management
- **Hardware Catalog**: Mortise Handles, Lever Rose Sets, Heavy Duty Hinges, Cabinet Knobs, Pull Handles, and Brass Tower Bolts.
- **Bill of Materials (BOM) Breakdown**: Each product includes linked raw material alloy weights, sub-components, electroplating finish specifications, unit prices, and stock threshold levels.
- **Live Stock Alerts**: Low stock indicator badges when finished goods drop below safety reorder thresholds.
- **Search & Filtering**: Instant search by SKU, product name, hardware category, or electroplating finish.
- **Product Creation & Editing**: Modal interface to update pricing, stock levels, finish variants, and BOM lists.

---

### 🔩 3. Raw Materials & Sub-Components Inventory
- **Sub-Assembly & Hardware Parts**: Brass ingots, zinc die-cast components, rose plates, stainless steel latch mechanisms, springs, and assembly screws.
- **Stock Control**: Live quantity on hand, minimum reorder alert levels, unit costs, and supplier references.
- **Material Categories**: Ingot / Metal Alloy, Stamped Plate, Precision Lathe Part, Fastener / Fixing, Mechanism, and Packaging Supply.

---

### 🏭 4. 12-Stage Shopfloor Kanban Pipeline
Track production batches across the entire 12-stage manufacturing pipeline:
1. **Stage 1: Melting & Brass Casting**
2. **Stage 2: Machining & CNC Lathe Operations**
3. **Stage 3: Stamping & Metal Pressing**
4. **Stage 4: Hand Grinding & Fettling**
5. **Stage 5: Surface Deburring & Polishing**
6. **Stage 6: Ultrasonic Cleaning & Degreasing**
7. **Stage 7: Electroplating / PVD Coating**
8. **Stage 8: Lacquering & Oven Baking**
9. **Stage 9: Quality Control (QC) Inspection**
10. **Stage 10: Sub-Assembly & Hardware Fitting**
11. **Stage 11: Final Boxing & Packaging**
12. **Stage 12: Dispatch & Logistics**

- **Interactive Stage Management**: Move batches forward or backward across stages with single-click actions or drag-and-drop.
- **Batch Metadata**: Serial codes, allocated worker leads, batch quantities, completed parts count, and stage yield rate calculation.

---

### 🛒 5. Purchase Order (PO) & Production Order Management
- **Multi-Line Order Creation**: Build purchase orders for clients with customizable quantities, finishes, unit prices, and delivery dates.
- **⚡ Quick Production Article Presets Bar**: Instantaneously populate order line items using pre-configured factory product blueprints (e.g. "Satin Brass Lever Set", "Antique Bronze Pull Handle", "Matte Black Cabinet Knob").
- **Order Status Lifecycle**: Track POs through `Pending`, `Scheduled`, `In Production`, `QC Approved`, `Dispatched`, and `Invoiced`.
- **Order Details Modal**: Line item breakdown, client address details, payment status, and dispatch tracking.

---

### 📉 6. Stage Defect & Process Matrix
- **Part-Level Defect Tracking**: Matrix mapping defects across stages 1 through 12.
- **Defect Categories**: Pitting, uneven electroplating, scratches, porosity, dimensional tolerance variance, and lacquer peeling.
- **Yield Calculation**: Automatic stage pass rate percentage and rejection volume per batch.
- **Worker Accountability**: Associate defect logs with specific line leads and production shifts.

---

### 🔍 7. Quality Control (QC) & Inspection Audit
- **QC Inspection Logs**: Formal pass/fail audit reports for finished batches before final packaging.
- **Serial Part Tracking**: Log passed vs. rejected part counts with root cause classifications.
- **Defect Action Handling**: Route rejected parts for re-work (e.g., re-polishing, re-plating) or scrap.

---

### 🏢 8. Client Directory & Account Management
- **Commercial Directory**: Maintain accounts for architectural distributors, hardware retailers, and export partners.
- **Client Metadata**: Contact details, GSTIN/Tax ID, shipping addresses, default payment terms (e.g., NET 30, 50% Advance), and lifetime order statistics.

---

### 👥 9. Users & Role-Based Access Control (RBAC)
- **Staff Directory**: Multi-role team management (Plant Operations Manager, Production Line Lead, Warehouse Officer, QC Inspector, Sales Account Manager).
- **Granular Section Permissions**: Enable or disable access for any user or role across all 10 ERP sections.
- **⚡ Smart Title Auto-Detector**: Automatically detects role titles typed into the custom role creator (e.g., "Polishing Supervisor") and offers a 1-click suggested permission preset.
- **Suggested Permission Sets**: Built-in archetype blueprints for fast, accurate permission configuration.

---

### ⚙️ 10. Master Settings & Factory Configuration Manager
- **Quick Production Preset Manager**: Create and manage article presets with pre-defined BOMs, default finishes, target quantities, and unit prices.
- **Hardware Finishes Catalog**: Configure factory electroplating & coating options (Satin Brass, Antique Bronze, Matte Black, Polished Chrome, Rose Gold, PVD Brass).
- **Raw Material Alloys**: Manage metal grades (Brass CZ121, ZAMAK 3 Zinc, Stainless Steel 304, Aluminum Alloy).
- **Units of Measure (UOM)**: Configure measurement units (Set, Piece, Pair, Kg, Box, Meter).
- **Defect Classifications & Stations**: Custom factory station routing and defect taxonomy.
- **Role Permission Suggestions Library**: Central reference matrix mapping all 10 ERP sections to recommended factory roles.
- **System Activity Log & Audit Trail**: Immutable system timeline recording user logins, PO modifications, inventory updates, and setting changes.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React Icons, Motion animations, Recharts data visualization.
- **Backend**: Express v4 Node.js server with Vite v6 middleware in dev mode and esbuild bundled CommonJS runtime (`dist/server.cjs`) in production.
- **AI Integration**: Prepared for Gemini API via `@google/genai` TypeScript SDK.
- **Styling**: Tailwind CSS v4 utility classes with clean light-theme aesthetic, high contrast typography, and accessible visual indicators.

---

## 💻 Local Development & Build

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# 1. Clone the repository
git clone <repo-url>
cd hardware-factory-erp

# 2. Install dependencies
npm install

# 3. Start development server (runs on http://localhost:3000)
npm run dev
```

### Production Build
```bash
# Build Vite client & bundle Express server with esbuild
npm run build

# Start production server
npm run start
```

---

## 📁 Project Directory Structure

```
├── src/
│   ├── components/
│   │   ├── DashboardView.tsx         # Executive KPIs & Factory Overview
│   │   ├── ProductsView.tsx          # Finished Goods Catalog & BOM
│   │   ├── ComponentsView.tsx        # Raw Materials & Sub-Assemblies Inventory
│   │   ├── KanbanView.tsx            # 12-Stage Production Line Kanban Board
│   │   ├── OrdersView.tsx            # Purchase Orders & Line Item Details
│   │   ├── NewOrderModal.tsx         # Order Creator with Quick Presets Bar
│   │   ├── MatrixView.tsx            # Stage Defect & Yield Process Matrix
│   │   ├── QCView.tsx                # Quality Control Inspection & Audit Logs
│   │   ├── ClientsView.tsx           # Commercial Clients Directory
│   │   ├── UsersView.tsx             # Staff Directory, RBAC & Role Creator
│   │   └── MasterSettingsManager.tsx # Presets, Finishes, Materials & Audit Log
│   ├── data/
│   │   └── initialData.ts            # Seed Data for Products, Presets & Orders
│   ├── types/
│   │   └── erp.ts                    # TypeScript Interfaces & Types
│   ├── utils/
│   │   └── rbac.ts                   # RBAC Rules, Tabs & Smart Suggestions
│   ├── App.tsx                       # Main Application Shell & Navigation
│   ├── main.tsx                      # Application Entry Point
│   └── index.css                     # Global Styles & Tailwind CSS Imports
├── server.ts                         # Full-Stack Express Server Entry
├── metadata.json                     # Applet Metadata
├── package.json                      # Build Scripts & Dependencies
└── README.md                         # Project Documentation
```

---

*Built for precision hardware manufacturing, architectural brassware, electroplating, and factory floor operations.*
