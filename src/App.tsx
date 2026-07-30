import React, { useState, useEffect } from 'react';
import { ErpDataState, ErpUser, Client } from './types/erp';
import { initialUsers } from './data/initialData';
import { loadErpState, saveErpState, resetErpState } from './utils/storage';
import { isTabAllowed, getUserAllowedTabs } from './utils/rbac';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InventoryManager } from './components/InventoryManager';
import { ProductionFlowManager } from './components/ProductionFlowManager';
import { KanbanBoard } from './components/KanbanBoard';
import { PartTrackingMatrix } from './components/PartTrackingMatrix';
import { FloorStationTerminal } from './components/FloorStationTerminal';
import { QcLogViewer } from './components/QcLogViewer';
import { UsersView } from './components/UsersView';
import { ClientsManager } from './components/ClientsManager';
import { NewOrderModal } from './components/NewOrderModal';
import { AiAdvisorModal } from './components/AiAdvisorModal';
import { AuthModal } from './components/AuthModal';
import { NotificationPanel } from './components/NotificationPanel';
import { Lock, ShieldAlert, ArrowRight } from 'lucide-react';


const TAB_LABELS: Record<string, string> = {
  dashboard: 'Factory Overview',
  products: 'Finished Goods Catalog',
  components: 'Component Inventory',
  kanban: '12-Stage Kanban Board',
  orders: 'Purchase Orders',
  matrix: 'Part Tracking Matrix',
  terminal: 'Shop Floor Terminal',
  qc: 'QC Defect Logs',
  users: 'User Accounts',
  clients: 'Clients Directory',
};

export default function App() {
  const [erpState, setErpState] = useState<ErpDataState>(() => loadErpState());
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'components' | 'kanban' | 'orders' | 'matrix' | 'terminal' | 'qc' | 'users' | 'clients'
  >('dashboard');
  
  // Navigation History Stack
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPoIdForMatrix, setSelectedPoIdForMatrix] = useState<string>(
    erpState.purchaseOrders[0]?.id || ''
  );

  // Authentication state
  const [currentUser, setCurrentUser] = useState<ErpUser | null>(initialUsers[0]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Modals
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  const [preselectedClientForOrder, setPreselectedClientForOrder] = useState<Client | null>(null);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState<boolean>(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState<boolean>(false);

  // Auto-save state updates to localStorage
  useEffect(() => {
    saveErpState(erpState);
  }, [erpState]);

  // Navigate with History Tracking
  const handleNavigate = (newTab: string) => {
    if (newTab === activeTab) return;
    window.history.pushState({ tab: newTab }, '', `#${newTab}`);
    setNavigationHistory((prev) => [...prev, activeTab]);
    setActiveTab(newTab as any);
  };

  // Go Back Handler
  const handleGoBack = () => {
    if (navigationHistory.length > 0) {
      const previousTab = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((prev) => prev.slice(0, prev.length - 1));
      setActiveTab(previousTab as any);
    } else if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  };

  // Browser Native Popstate (Back/Forward) Listener
  useEffect(() => {
    const handlePopState = () => {
      if (navigationHistory.length > 0) {
        const prevTab = navigationHistory[navigationHistory.length - 1];
        setNavigationHistory((prev) => prev.slice(0, prev.length - 1));
        setActiveTab(prevTab as any);
      } else {
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigationHistory]);

  const lastHistoryTab = navigationHistory[navigationHistory.length - 1];
  const previousTabLabel = TAB_LABELS[lastHistoryTab] || 'Previous Screen';
  const canGoBack = navigationHistory.length > 0 || activeTab !== 'dashboard';

  // Calculations for Badges
  const activePOs = erpState.purchaseOrders.filter((po) => po.overallStatus !== 'Dispatched');
  const allPartOrders = activePOs.flatMap((po) => po.partWorkOrders);
  const activeBottlenecksCount = allPartOrders.filter(
    (pwo) => pwo.bottleneckAlert || pwo.status === 'QC Flagged'
  ).length;

  const lowStockCount =
    erpState.components.filter((c) => c.stockQty <= c.reorderPoint).length +
    erpState.products.filter((p) => p.stockQty <= p.reorderPoint).length;

  const totalNotificationsCount =
    lowStockCount +
    erpState.qcLogs.filter((q) => q.defectCount > 0).length +
    activePOs.filter((p) => p.priority === 'Urgent' || p.priority === 'High Priority').length;

  const handleResetData = () => {
    if (window.confirm('Reset factory data back to demo dataset?')) {
      const reset = resetErpState();
      setErpState(reset);
      if (reset.purchaseOrders.length > 0) {
        setSelectedPoIdForMatrix(reset.purchaseOrders[0].id);
      }
    }
  };

  const isCurrentTabAllowed = isTabAllowed(currentUser, activeTab as any, erpState.roles);
  const allowedTabs = getUserAllowedTabs(currentUser, erpState.roles);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col md:flex-row">
      
      {/* Dark Navy Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => handleNavigate(tab)}
        activeBottlenecksCount={activeBottlenecksCount}
        lowStockCount={lowStockCount}
        activePoCount={activePOs.length}
        currentUser={currentUser}
        rolesList={erpState.roles}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
        
        {/* Top Header Navbar */}
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => handleNavigate(tab)}
          activeBottlenecksCount={activeBottlenecksCount}
          lowStockCount={lowStockCount}
          activePoCount={activePOs.length}
          onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
          onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
          onOpenNotifications={() => setIsNotificationPanelOpen(true)}
          notificationCount={totalNotificationsCount}
          onResetData={handleResetData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          rolesList={erpState.roles}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Main View Area */}
        <main className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto flex-1">
          {!isCurrentTabAllowed ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4 max-w-md mx-auto my-12 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 shadow-sm">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Access Restricted</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your current account (<strong className="text-slate-800">{currentUser?.name}</strong>, Role: <span className="font-extrabold uppercase text-blue-600">{currentUser?.role}</span>) does not have operational permissions to access <strong>{TAB_LABELS[activeTab] || activeTab}</strong>.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => handleNavigate(allowedTabs[0] || 'dashboard')}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <span>Go to {TAB_LABELS[allowedTabs[0]] || 'Permitted View'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer transition-colors"
                >
                  Switch User Session
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  state={erpState}
                  setActiveTab={(tab) => handleNavigate(tab)}
                  onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
                  onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
                  setSelectedPoIdForMatrix={(poId) => setSelectedPoIdForMatrix(poId)}
                />
              )}

              {(activeTab === 'products' || activeTab === 'components') && (
                <InventoryManager
                  state={erpState}
                  setState={setErpState}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === 'kanban' && (
                <KanbanBoard
                  state={erpState}
                  setState={setErpState}
                  searchQuery={searchQuery}
                  onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
                />
              )}

              {activeTab === 'orders' && (
                <ProductionFlowManager
                  state={erpState}
                  setSelectedPoIdForMatrix={setSelectedPoIdForMatrix}
                  setActiveTab={(tab: any) => handleNavigate(tab)}
                  onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === 'matrix' && (
                <PartTrackingMatrix
                  state={erpState}
                  setState={setErpState}
                  selectedPoId={selectedPoIdForMatrix || erpState.purchaseOrders[0]?.id || ''}
                  setSelectedPoId={setSelectedPoIdForMatrix}
                  setActiveTab={(tab: any) => handleNavigate(tab)}
                  onGoBack={handleGoBack}
                />
              )}

              {activeTab === 'terminal' && (
                <FloorStationTerminal
                  state={erpState}
                  setState={setErpState}
                />
              )}

              {activeTab === 'qc' && (
                <QcLogViewer
                  state={erpState}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === 'users' && (
                <UsersView
                  currentUser={currentUser}
                  setCurrentUser={(usr) => setCurrentUser(usr)}
                  state={erpState}
                  setState={setErpState}
                />
              )}

              {activeTab === 'clients' && (
                <ClientsManager
                  state={erpState}
                  setState={setErpState}
                  searchQuery={searchQuery}
                  onOpenNewOrderWithClient={(client) => {
                    setPreselectedClientForOrder(client);
                    setIsNewOrderModalOpen(true);
                  }}
                />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
          <div className="max-w-[1600px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              HandleWorks Factory ERP &copy; {new Date().getFullYear()} Modern Hardware Manufacturing.
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              12-Stage Visual Kanban Pipeline • Active User: {currentUser?.name} ({currentUser?.role})
            </span>
          </div>
        </footer>
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
            const userAllowed = getUserAllowedTabs(user, erpState.roles);
            if (!userAllowed.includes(activeTab as any) && userAllowed.length > 0) {
              setActiveTab(userAllowed[0]);
            }
          }}
          onClose={() => setIsAuthModalOpen(false)}
          users={erpState.users}
        />
      )}

      {/* Global New Order Modal */}
      {isNewOrderModalOpen && (
        <NewOrderModal
          state={erpState}
          setState={setErpState}
          preselectedClient={preselectedClientForOrder}
          onClose={() => {
            setIsNewOrderModalOpen(false);
            setPreselectedClientForOrder(null);
          }}
          setSelectedPoIdForMatrix={setSelectedPoIdForMatrix}
          setActiveTab={(tab: any) => handleNavigate(tab)}
        />
      )}

      {/* AI Factory Advisor Modal */}
      {isAiAdvisorOpen && (
        <AiAdvisorModal
          state={erpState}
          onClose={() => setIsAiAdvisorOpen(false)}
        />
      )}

      {/* Slide-out Real-time Factory Event Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        state={erpState}
        setState={setErpState}
        setActiveTab={(tab: any) => handleNavigate(tab)}
        setSelectedPoIdForMatrix={setSelectedPoIdForMatrix}
        onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
      />

    </div>
  );
}
