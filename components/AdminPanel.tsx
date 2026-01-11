
import React, { useState } from 'react';
import { BotServer, ServerStatus, User } from '../types';

interface AdminPanelProps {
  servers: BotServer[];
  setServers: React.Dispatch<React.SetStateAction<BotServer[]>>;
  authorizedUsers: User[];
  setAuthorizedUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const PRIMARY_ADMIN_USER = 'admin';

export const AdminPanel: React.FC<AdminPanelProps> = ({ servers, setServers, authorizedUsers, setAuthorizedUsers }) => {
  const [activeTab, setActiveTab] = useState<'SERVERS' | 'USERS'>('SERVERS');
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const toggleSuspend = (id: string) => {
    setServers(prev => prev.map(s => {
      if (s.id !== id) return s;
      return { ...s, status: s.status === ServerStatus.SUSPENDED ? ServerStatus.STOPPED : ServerStatus.SUSPENDED };
    }));
  };

  const handleConfirmedDelete = () => {
    if (!confirmingDelete) return;
    setServers(prev => prev.filter(s => s.id !== confirmingDelete));
    setConfirmingDelete(null);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user = newUsername.trim().toLowerCase();
    const pass = newUserPassword.trim();
    
    if (user && pass) {
      if (authorizedUsers.some(u => u.username.toLowerCase() === user)) {
        alert("User already exists.");
        return;
      }
      setAuthorizedUsers(prev => [...prev, { username: user, passwordHash: pass }]);
      setNewUsername('');
      setNewUserPassword('');
      setSuccessMsg(`User ${user} created successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleRemoveUser = (username: string) => {
    if (username.toLowerCase() === PRIMARY_ADMIN_USER) {
      alert("Error: Primary admin access cannot be revoked.");
      return;
    }
    if (confirm(`Revoke access for ${username}?`)) {
      setAuthorizedUsers(prev => prev.filter(u => u.username.toLowerCase() !== username.toLowerCase()));
    }
  };

  const serverToDelete = servers.find(s => s.id === confirmingDelete);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button 
          onClick={() => setActiveTab('SERVERS')}
          className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === 'SERVERS' ? 'bg-indigo-600 text-white' : 'text-neutral-500 hover:text-white'}`}
        >
          Active Clusters
        </button>
        <button 
          onClick={() => setActiveTab('USERS')}
          className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === 'USERS' ? 'bg-indigo-600 text-white' : 'text-neutral-500 hover:text-white'}`}
        >
          Access Control
        </button>
      </div>

      {activeTab === 'SERVERS' ? (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-[9px] font-black text-neutral-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-5">Instance / ID</th>
                  <th className="px-6 py-5">Owner Identity</th>
                  <th className="px-6 py-5">Operational Status</th>
                  <th className="px-6 py-5 text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {servers.map(server => (
                  <tr key={server.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-neutral-100">{server.name}</div>
                      <div className="text-[10px] text-neutral-600 font-mono mt-0.5">{server.id}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-500 font-mono">{server.owner}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                        server.status === ServerStatus.RUNNING ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        server.status === ServerStatus.SUSPENDED ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        'bg-white/5 text-neutral-500 border border-white/10'
                      }`}>
                        {server.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button 
                        onClick={() => toggleSuspend(server.id)}
                        className="p-3 text-amber-500 hover:bg-amber-500/10 rounded-2xl transition-all active:scale-90"
                        title="Suspend / Resume"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => setConfirmingDelete(server.id)}
                        className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-90"
                        title="Delete Instance"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Add User Form */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-2xl lg:sticky lg:top-24">
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Authorize New User</h3>
            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-8 leading-relaxed">Create additional user accounts with specific credentials for panel access.</p>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.2em] ml-1">Username</label>
                <input 
                  type="text" 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-mono text-white outline-none focus:border-indigo-500 transition-colors shadow-inner"
                  placeholder="e.g. jdoe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.2em] ml-1">Password</label>
                <input 
                  type="text" 
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-mono text-white outline-none focus:border-indigo-500 transition-colors shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {successMsg && (
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  {successMsg}
                </p>
              )}

              <button 
                type="submit"
                className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
              >
                Create User
              </button>
            </form>
          </div>

          {/* User List */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
             <div className="p-6 bg-white/5 border-b border-white/5">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Authorized Personnel</h3>
             </div>
             <div className="divide-y divide-white/[0.03]">
                {authorizedUsers.map(user => (
                  <div key={user.username} className="flex items-center justify-between p-6 group hover:bg-white/[0.01] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${user.username.toLowerCase() === PRIMARY_ADMIN_USER ? 'bg-amber-500/10 text-amber-500' : 'bg-neutral-900 text-neutral-500'}`}>
                        {user.username.toLowerCase() === PRIMARY_ADMIN_USER ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-neutral-100">{user.username}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600">
                            {user.username.toLowerCase() === PRIMARY_ADMIN_USER ? 'System Administrator' : 'Authorized User'}
                          </span>
                          <span className="text-neutral-800 text-[8px]">•</span>
                          <span className="text-[9px] font-mono text-neutral-700">Pass: {user.username.toLowerCase() === PRIMARY_ADMIN_USER ? '********' : user.passwordHash}</span>
                        </div>
                      </div>
                    </div>
                    {user.username.toLowerCase() !== PRIMARY_ADMIN_USER && (
                      <button 
                        onClick={() => handleRemoveUser(user.username)}
                        className="p-3 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all active:scale-90"
                        title="Revoke Access"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Confirm Destruction</h3>
            <p className="text-[10px] font-bold text-neutral-500 mb-8 uppercase tracking-widest leading-relaxed">
              Permanently destroy <span className="text-rose-500">{serverToDelete?.name}</span>? This action deletes all binary volumes and configuration data.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmingDelete(null)} 
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-neutral-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Abort
              </button>
              <button 
                onClick={handleConfirmedDelete} 
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
