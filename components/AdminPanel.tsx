
import React, { useState } from 'react';
import { BotServer, ServerStatus } from '../types';

interface AdminPanelProps {
  servers: BotServer[];
  setServers: React.Dispatch<React.SetStateAction<BotServer[]>>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ servers, setServers }) => {
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

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

  const serverToDelete = servers.find(s => s.id === confirmingDelete);

  return (
    <div className="space-y-6">
      <div className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1c2128] text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5">Instance / ID</th>
                <th className="px-6 py-5">Owner</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Limits (CPU/RAM)</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {servers.map(server => (
                <tr key={server.id} className="hover:bg-slate-800/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-white">{server.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{server.id}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">{server.owner}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${
                      server.status === ServerStatus.RUNNING ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      server.status === ServerStatus.SUSPENDED ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {server.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    <span className="font-bold text-slate-300">{server.limits.cpu}vCores</span> • <span className="font-bold text-slate-300">{server.limits.ram}MB</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button 
                      onClick={() => toggleSuspend(server.id)}
                      className="p-2.5 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all active:scale-90"
                      title={server.status === ServerStatus.SUSPENDED ? "Unsuspend" : "Suspend"}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setConfirmingDelete(server.id)}
                      className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all active:scale-90"
                      title="Delete Permanently"
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

      {confirmingDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1c2128] border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Confirm Destruction</h3>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              You are about to permanently delete <span className="text-rose-400 font-bold">{serverToDelete?.name}</span>. This will destroy all associated container data and volumes. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmingDelete(null)} 
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmedDelete} 
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-rose-500/20 transition-colors"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
