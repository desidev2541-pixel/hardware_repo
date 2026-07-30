import React, { useState } from 'react';
import { ErpUser, UserRole } from '../types/erp';
import { initialUsers } from '../data/initialData';
import {
  Factory,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface AuthModalProps {
  onLoginSuccess: (user: ErpUser) => void;
  onClose?: () => void;
  users?: ErpUser[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onLoginSuccess,
  onClose,
  users = initialUsers,
}) => {
  const [email, setEmail] = useState(users[0]?.email || 'admin@handleworks.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchedUser) {
      onLoginSuccess(matchedUser);
    } else {
      // Default fallback account for custom logins
      const customUser: ErpUser = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0].toUpperCase(),
        email: email,
        role: 'SUPERVISOR',
        title: 'Factory Supervisor',
      };
      onLoginSuccess(customUser);
    }
  };

  const selectQuickAccount = (user: ErpUser) => {
    setEmail(user.email);
    setPassword('password123');
    onLoginSuccess(user);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner Header */}
        <div className="bg-slate-900 text-white p-6 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/40">
            <Factory className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">HANDLEWORKS ERP</h2>
          <p className="text-xs text-slate-400 mt-1">
            Factory Floor & 12-Stage Part Production System
          </p>
        </div>

        {/* Login Form */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@handleworks.com"
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Shop Floor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts Selector */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick Role Test Logins
            </p>
            <div className="grid grid-cols-2 gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => selectQuickAccount(u)}
                  className="p-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer"
                >
                  <p className="font-bold text-slate-800 text-xs truncate">{u.name}</p>
                  <span className="text-[9px] font-bold text-blue-600 uppercase">{u.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
