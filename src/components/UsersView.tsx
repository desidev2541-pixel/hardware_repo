import React, { useState } from 'react';
import { ErpUser, RoleDefinition, ErpTabId, ErpDataState } from '../types/erp';
import { ALL_ERP_TABS, INITIAL_ROLES } from '../utils/rbac';
import { initialUsers } from '../data/initialData';
import {
  Users,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Mail,
  CheckCircle,
  UserCheck,
  Building,
  Shield,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Check,
  X,
  Sparkles,
  Layers,
  Crown,
  Laptop,
  AlertTriangle
} from 'lucide-react';

interface UsersViewProps {
  currentUser: ErpUser | null;
  setCurrentUser: (user: ErpUser) => void;
  state: ErpDataState;
  setState: React.Dispatch<React.SetStateAction<ErpDataState>>;
}

export const UsersView: React.FC<UsersViewProps> = ({
  currentUser,
  setCurrentUser,
  state,
  setState,
}) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'ROLES'>('USERS');

  // Roles list from state or fallback
  const rolesList: RoleDefinition[] = state?.roles && state.roles.length > 0 ? state.roles : INITIAL_ROLES;
  const usersList: ErpUser[] = state?.users ? state.users : initialUsers;

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    role: string;
    title: string;
  }>({
    name: '',
    email: '',
    role: 'SUPERVISOR',
    title: '',
  });

  // Create Role Modal State
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<{
    name: string;
    description: string;
    allowedTabs: ErpTabId[];
  }>({
    name: '',
    description: '',
    allowedTabs: ['kanban', 'terminal', 'qc'],
  });

  // Edit Role Modal State
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'USER' | 'ROLE';
    id: string;
    name: string;
  } | null>(null);

  // Handlers for Users
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const userObj: ErpUser = {
      id: `usr-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      title: newUser.title || `${newUser.role} Staff`,
    };

    setState((prev) => ({
      ...prev,
      users: [...(prev.users || usersList), userObj],
    }));

    setIsAddUserModalOpen(false);
    setNewUser({ name: '', email: '', role: 'SUPERVISOR', title: '' });
  };

  const handleDeleteUserClick = (userId: string, userName: string) => {
    setDeleteConfirmation({
      type: 'USER',
      id: userId,
      name: userName,
    });
  };

  const handleDeleteRoleClick = (roleId: string, roleName: string) => {
    setDeleteConfirmation({
      type: 'ROLE',
      id: roleId,
      name: roleName,
    });
  };

  const executeDelete = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === 'USER') {
      const userId = deleteConfirmation.id;
      const currentUsers = state?.users ? state.users : usersList;
      const remainingUsers = currentUsers.filter((u) => u.id !== userId);

      setState((prev) => ({
        ...prev,
        users: remainingUsers,
      }));

      if (currentUser?.id === userId && remainingUsers.length > 0) {
        setCurrentUser(remainingUsers[0]);
      }
    } else if (deleteConfirmation.type === 'ROLE') {
      const roleId = deleteConfirmation.id;
      const roleName = deleteConfirmation.name;

      const currentRoles = state?.roles && state.roles.length > 0 ? state.roles : INITIAL_ROLES;
      const updatedRoles = currentRoles.filter((r) => r.id !== roleId && r.name !== roleName);

      const currentUsers = state?.users ? state.users : usersList;
      const updatedUsers = currentUsers.map((u) => {
        if (u.role === roleName || u.role === roleId) {
          return { ...u, role: 'SUPERVISOR' };
        }
        return u;
      });

      setState((prev) => ({
        ...prev,
        roles: updatedRoles,
        users: updatedUsers,
      }));
    }

    setDeleteConfirmation(null);
  };

  // Handlers for Roles
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name) return;

    const roleObj: RoleDefinition = {
      id: `role-${Date.now()}`,
      name: newRole.name,
      description: newRole.description || 'Custom Operational Role created by administrator.',
      isSystemRole: false,
      roleBadgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      allowedTabs: newRole.allowedTabs,
    };

    setState((prev) => ({
      ...prev,
      roles: [...rolesList, roleObj],
    }));

    setIsCreateRoleModalOpen(false);
    setNewRole({ name: '', description: '', allowedTabs: ['kanban', 'terminal', 'qc'] });
  };

  const handleSaveRolePermissionEdit = (updatedRole: RoleDefinition) => {
    setState((prev) => {
      const currentRoles = prev.roles && prev.roles.length > 0 ? prev.roles : INITIAL_ROLES;
      const updated = currentRoles.map((r) => (r.id === updatedRole.id ? updatedRole : r));
      return {
        ...prev,
        roles: updated,
      };
    });
    setEditingRole(null);
  };

  const getRoleBadge = (roleName: string) => {
    if (roleName === 'SUPER_ADMIN') {
      return 'bg-purple-950 text-purple-200 border-purple-700 font-black ring-1 ring-purple-500/50';
    }
    if (roleName === 'ADMIN') {
      return 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold';
    }
    if (roleName === 'MANAGER') {
      return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
    }
    if (roleName === 'SUPERVISOR') {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
    }
    if (roleName === 'QC') {
      return 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
    }
    return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
  };

  const getRoleTypeLabel = (roleName: string) => {
    if (roleName === 'SUPER_ADMIN') return 'Developer / Maintainer';
    if (roleName === 'ADMIN') return 'Factory Owner';
    return 'Operational Role';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Tab Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                User Accounts & Customizable RBAC Roles
              </h2>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                Granular Permissions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage developer level access, factory owner privileges, and custom operation-wise module permissions.
            </p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'USERS'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ROLES')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'ROLES'
                ? 'bg-white text-purple-700 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-600" />
            <span>Roles & Permissions Matrix ({rolesList.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW TAB 1: USER ACCOUNTS */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <span>Active ERP User Sessions</span>
              <span className="text-xs font-medium text-slate-500">
                (Logged in user: <strong className="text-blue-700">{currentUser?.name}</strong> - {currentUser?.role})
              </span>
            </h3>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User Account</span>
            </button>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usersList.map((usr) => {
              const isCurrent = currentUser?.email === usr.email;
              const matchedRole = rolesList.find((r) => r.name.toLowerCase() === usr.role.toLowerCase() || r.id === usr.role);
              const allowedTabsCount = matchedRole ? matchedRole.allowedTabs.length : (usr.role === 'SUPER_ADMIN' || usr.role === 'ADMIN' ? 10 : 4);

              return (
                <div
                  key={usr.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-2xs relative flex flex-col justify-between space-y-4 ${
                    isCurrent
                      ? 'border-blue-500 ring-2 ring-blue-400/30 bg-blue-50/20'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center text-white ${
                          usr.role === 'SUPER_ADMIN'
                            ? 'bg-purple-950 ring-2 ring-purple-600'
                            : usr.role === 'ADMIN'
                            ? 'bg-purple-700'
                            : 'bg-slate-800'
                        }`}>
                          {usr.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{usr.name}</p>
                          <p className="text-xs font-medium text-slate-500">{usr.title}</p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getRoleBadge(usr.role)}`}>
                        {usr.role}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Email Login:</span>
                        <span className="font-mono font-bold text-slate-800">{usr.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Role Tier:</span>
                        <span className="font-extrabold text-purple-700">{getRoleTypeLabel(usr.role)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Module Access:</span>
                        <span className="font-bold text-blue-600">{allowedTabsCount} / 10 Sections Allowed</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-extrabold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Active Session</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setCurrentUser(usr)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Switch Session</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteUserClick(usr.id, usr.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-auto"
                      title={`Delete User Account ${usr.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW TAB 2: ROLES & SECTION PERMISSIONS MATRIX */}
      {activeTab === 'ROLES' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>Operation-wise Customizable Roles & Section Permissions</span>
              </h3>
              <p className="text-xs text-slate-500">
                Create role choices (e.g. Polishing Manager, Plating Lead) and configure section access toggles.
              </p>
            </div>

            <button
              onClick={() => setIsCreateRoleModalOpen(true)}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Custom Operational Role</span>
            </button>
          </div>

          {/* Role Access Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4 min-w-[200px]">Role Name & Tier</th>
                    <th className="p-4 min-w-[220px]">Role Description</th>
                    <th className="p-4 text-center min-w-[140px]">Allowed Sections</th>
                    <th className="p-4 min-w-[340px]">Permitted ERP Sections</th>
                    <th className="p-4 text-right min-w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {rolesList.map((role) => {
                    const isSuperAdmin = role.name === 'SUPER_ADMIN';
                    const isAdmin = role.name === 'ADMIN';

                    return (
                      <tr key={role.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {isSuperAdmin && <Laptop className="w-4 h-4 text-purple-400" />}
                              {isAdmin && <Crown className="w-4 h-4 text-amber-500" />}
                              <span className={`text-xs uppercase px-2.5 py-1 rounded-lg border font-black ${getRoleBadge(role.name)}`}>
                                {role.name}
                              </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">
                              {getRoleTypeLabel(role.name)}
                            </p>
                          </div>
                        </td>

                        <td className="p-4">
                          <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xs">
                            {role.description}
                          </p>
                        </td>

                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                            role.allowedTabs.length === 10
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}>
                            {role.allowedTabs.length} / 10 Sections
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {ALL_ERP_TABS.map((tab) => {
                              const hasAccess = role.allowedTabs.includes(tab.id);
                              return (
                                <span
                                  key={tab.id}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                    hasAccess
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                                  }`}
                                >
                                  {hasAccess ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <X className="w-3 h-3 text-slate-400" />
                                  )}
                                  <span>{tab.name}</span>
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingRole(role)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-lg font-bold text-xs border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                              title="Edit Section Access Toggles"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Toggles</span>
                            </button>

                            <button
                              onClick={() => handleDeleteRoleClick(role.id, role.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title={`Delete Role ${role.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* MODAL 1: ADD NEW USER ACCOUNT */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">Add Factory User Account</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address (Login ID)</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@handleworks.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Operational Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-slate-800"
                >
                  {rolesList.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.allowedTabs.length} Sections Allowed)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Title / Department</label>
                <input
                  type="text"
                  placeholder="e.g. Polishing Line Manager"
                  value={newUser.title}
                  onChange={(e) => setNewUser({ ...newUser, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE NEW CUSTOM OPERATIONAL ROLE */}
      {isCreateRoleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-extrabold text-slate-900">Create Custom Operational Role</h3>
              </div>
              <button
                onClick={() => setIsCreateRoleModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Title / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Polishing Manager, Plating Lead, Warehouse Officer"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Scope Description</label>
                <input
                  type="text"
                  placeholder="e.g. Responsible for Stage 5 surface polishing, component stock & line terminal"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Section Toggles Selector */}
              <div>
                <label className="block font-extrabold text-slate-900 mb-2">
                  Select Permitted ERP Sections ({newRole.allowedTabs.length} / 10 Allowed):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {ALL_ERP_TABS.map((tab) => {
                    const isSelected = newRole.allowedTabs.includes(tab.id);
                    return (
                      <label
                        key={tab.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-50 border-purple-300 ring-1 ring-purple-300'
                            : 'bg-white border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRole((prev) => ({ ...prev, allowedTabs: [...prev.allowedTabs, tab.id] }));
                            } else {
                              setNewRole((prev) => ({ ...prev, allowedTabs: prev.allowedTabs.filter((t) => t !== tab.id) }));
                            }
                          }}
                          className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{tab.name}</p>
                          <p className="text-[10px] text-slate-500 leading-tight">{tab.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateRoleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Save Custom Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT ROLE PERMISSION TOGGLES */}
      {editingRole && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Configure Permissions: <span className="text-purple-700">{editingRole.name}</span>
                </h3>
              </div>
              <button
                onClick={() => setEditingRole(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Toggle section access for <strong>{editingRole.name}</strong>. Changes will take effect across the ERP interface immediately.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {ALL_ERP_TABS.map((tab) => {
                  const isSelected = editingRole.allowedTabs.includes(tab.id);
                  return (
                    <label
                      key={tab.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                          : 'bg-white border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const updatedTabs = e.target.checked
                            ? [...editingRole.allowedTabs, tab.id]
                            : editingRole.allowedTabs.filter((t) => t !== tab.id);

                          setEditingRole({
                            ...editingRole,
                            allowedTabs: updatedTabs,
                          });
                        }}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{tab.name}</p>
                        <p className="text-[10px] text-slate-500 leading-tight">{tab.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveRolePermissionEdit(editingRole)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Save Section Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION MODAL */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 border border-rose-200 shadow-sm">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Confirm Deletion
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Are you sure you want to delete this {deleteConfirmation.type === 'USER' ? 'user account' : 'role'}?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-800 flex items-center justify-between">
              <span className="text-slate-500 font-semibold">
                Target {deleteConfirmation.type === 'USER' ? 'User' : 'Role'}:
              </span>
              <span className="font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                {deleteConfirmation.name}
              </span>
            </div>

            {deleteConfirmation.type === 'USER' && currentUser?.id === deleteConfirmation.id && (
              <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 font-medium leading-relaxed">
                ⚠️ Note: You are currently logged in as this user. Deleting it will automatically switch your session to another active account.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
