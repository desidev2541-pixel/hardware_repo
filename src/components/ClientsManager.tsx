import React, { useState } from 'react';
import {
  ErpDataState,
  Client,
  PurchaseOrder
} from '../types/erp';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  User,
  Hash,
  X,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Package
} from 'lucide-react';

interface ClientsManagerProps {
  state: ErpDataState;
  setState: React.Dispatch<React.SetStateAction<ErpDataState>>;
  searchQuery: string;
  onOpenNewOrderWithClient?: (client: Client) => void;
}

export const ClientsManager: React.FC<ClientsManagerProps> = ({
  state,
  setState,
  searchQuery,
  onOpenNewOrderWithClient,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    deliveryAddress: '',
    taxId: '',
    contactPerson: '',
    notes: '',
  });

  const query = (localSearch || searchQuery || '').toLowerCase();

  // Filter Clients
  const filteredClients = (state.clients || []).filter((client) => {
    return (
      client.name.toLowerCase().includes(query) ||
      client.phone.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      (client.companyName && client.companyName.toLowerCase().includes(query)) ||
      (client.deliveryAddress && client.deliveryAddress.toLowerCase().includes(query)) ||
      (client.contactPerson && client.contactPerson.toLowerCase().includes(query))
    );
  });

  // Calculate Order statistics per client
  const getClientOrders = (client: Client): PurchaseOrder[] => {
    return (state.purchaseOrders || []).filter(
      (po) =>
        (po.clientId && po.clientId === client.id) ||
        po.clientName.toLowerCase() === client.name.toLowerCase() ||
        po.clientEmail.toLowerCase() === client.email.toLowerCase()
    );
  };

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      companyName: '',
      phone: '',
      email: '',
      deliveryAddress: '',
      taxId: '',
      contactPerson: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({ ...client });
    setIsAddModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.phone?.trim() || !formData.email?.trim()) {
      alert('Please fill in required fields (Client Name, Phone Number, and Email).');
      return;
    }

    if (editingClient) {
      // Update existing
      const updatedClients = state.clients.map((c) =>
        c.id === editingClient.id
          ? ({
              ...c,
              ...formData,
            } as Client)
          : c
      );
      setState((prev) => ({ ...prev, clients: updatedClients }));
    } else {
      // Create new
      const newClient: Client = {
        id: `cli-${Date.now()}`,
        name: formData.name.trim(),
        companyName: formData.companyName?.trim() || undefined,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        deliveryAddress: formData.deliveryAddress?.trim() || undefined,
        taxId: formData.taxId?.trim() || undefined,
        contactPerson: formData.contactPerson?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setState((prev) => ({ ...prev, clients: [newClient, ...prev.clients] }));
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    if (window.confirm(`Are you sure you want to delete client "${clientName}"?`)) {
      setState((prev) => ({
        ...prev,
        clients: prev.clients.filter((c) => c.id !== clientId),
      }));
    }
  };

  const copyAddress = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics
  const totalClients = state.clients?.length || 0;
  const clientsWithAddress = state.clients?.filter((c) => c.deliveryAddress && c.deliveryAddress.trim().length > 0).length || 0;
  const repeatClientsCount = state.clients?.filter((c) => getClientOrders(c).length > 0).length || 0;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Metrics Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Clients & Delivery Addresses Directory
                </h1>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs rounded-full">
                  {totalClients} Registered
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Maintain client contact records, phone differentiation numbers, and optional delivery destinations for accurate purchase order dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, phone, address..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Client Directory</p>
              <p className="text-lg font-extrabold text-slate-900 font-mono">{totalClients}</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Active Repeat Buyers</p>
              <p className="text-lg font-extrabold text-blue-900 font-mono">{repeatClientsCount}</p>
            </div>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Delivery Addresses Saved</p>
              <p className="text-lg font-extrabold text-emerald-900 font-mono">{clientsWithAddress}</p>
            </div>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Client Cards / List */}
      <div className="space-y-4">
        
        {/* View Toggle Bar */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600">
            Showing {filteredClients.length} of {totalClients} Clients
          </span>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-3">
            <Building2 className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-800 text-base">No Clients Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {query ? `No clients matched your search query "${query}".` : 'Get started by adding your first repeat client record.'}
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Client</span>
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* Cards Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => {
              const orders = getClientOrders(client);
              const totalSpent = orders.reduce((acc, po) => acc + po.totalAmount, 0);

              return (
                <div
                  key={client.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    
                    {/* Header: Name & Company */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-slate-900 text-base leading-snug flex items-center gap-1.5">
                          <span>{client.name}</span>
                        </h3>
                        {client.companyName && (
                          <p className="text-xs text-slate-500 font-medium">{client.companyName}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Client Information"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id, client.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Phone Indicator Badge (Highlights phone for differentiation) */}
                    <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5 font-mono font-bold text-blue-700">
                          <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{client.phone}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Unique Phone ID</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-mono text-[11px]">{client.email}</span>
                      </div>
                    </div>

                    {/* Delivery Address Box */}
                    <div className="bg-amber-50/50 border border-amber-200/70 rounded-xl p-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 text-[11px] uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          Delivery Destination Address
                        </span>
                        {client.deliveryAddress && (
                          <button
                            onClick={() => copyAddress(client.deliveryAddress!, client.id)}
                            className="text-[10px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer flex items-center gap-0.5"
                          >
                            {copiedId === client.id ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Copied!
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Copy className="w-3 h-3" /> Copy
                              </span>
                            )}
                          </button>
                        )}
                      </div>

                      <p className="text-slate-700 leading-relaxed font-medium">
                        {client.deliveryAddress || (
                          <span className="italic text-slate-400">No delivery address saved yet. (Optional)</span>
                        )}
                      </p>
                    </div>

                    {/* Additional Metadata */}
                    {(client.contactPerson || client.taxId || client.notes) && (
                      <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                        {client.contactPerson && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium">Contact: {client.contactPerson}</span>
                          </div>
                        )}
                        {client.taxId && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Hash className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono text-[11px]">Tax / GST: {client.taxId}</span>
                          </div>
                        )}
                        {client.notes && (
                          <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/70 italic">
                            "{client.notes}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Purchase Order Count & Create PO action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Order History</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {orders.length} Order{orders.length !== 1 ? 's' : ''} (${totalSpent.toLocaleString()})
                      </span>
                    </div>

                    {onOpenNewOrderWithClient && (
                      <button
                        onClick={() => onOpenNewOrderWithClient(client)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200/80 cursor-pointer transition-colors flex items-center gap-1 text-[11px]"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>+ New PO</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Table View Layout */
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="p-3.5 pl-5">Client Name</th>
                    <th className="p-3.5">Phone (Differentiating ID)</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Delivery Address</th>
                    <th className="p-3.5">Contact Person</th>
                    <th className="p-3.5">Orders</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredClients.map((client) => {
                    const orders = getClientOrders(client);
                    return (
                      <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 pl-5 font-bold text-slate-900">
                          <div>{client.name}</div>
                          {client.companyName && (
                            <div className="text-[11px] font-normal text-slate-500">{client.companyName}</div>
                          )}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-blue-700">
                          {client.phone}
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">
                          {client.email}
                        </td>
                        <td className="p-3.5 max-w-xs truncate text-slate-700">
                          {client.deliveryAddress || <span className="text-slate-400 italic">Not specified</span>}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {client.contactPerson || '-'}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {orders.length}
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(client)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Edit Client"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client.id, client.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Client"
                            >
                              <Trash2 className="w-4 h-4" />
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

      </div>

      {/* Add / Edit Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-fadeIn">
            
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {editingClient ? 'Edit Client Details' : 'Add New Client Record'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Store client information to simplify Purchase Order creation and dispatch.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 font-bold flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-5 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Client Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Hotel Group"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Company / Trade Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Hospitality West Corp"
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +1 (555) 019-2831"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-blue-700 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Phone differentiates clients with identical or repeated names.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. orders@apexhotel.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Delivery Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 742 Evergreen Terrace, Logistics Bay 4, Chicago, IL 60607"
                  value={formData.deliveryAddress || ''}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins (Procurement)"
                    value={formData.contactPerson || ''}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tax / GST / VAT ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. US-982341201"
                    value={formData.taxId || ''}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Special Notes / Finish Requirements
                </label>
                <input
                  type="text"
                  placeholder="e.g. Custom Satin Brass PVD finish preferred"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingClient ? 'Save Changes' : 'Save Client Record'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
