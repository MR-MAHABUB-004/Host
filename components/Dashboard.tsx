
import React, { useState } from 'react';
import { BotServer, ServerStatus } from '../types';

interface DashboardProps {
  servers: BotServer[];
  onSelectServer: (server: BotServer) => void;
  onCreateServer: (name: string) => void;
  currentUser: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ servers, onSelectServer, onCreateServer }) => {
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');

  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newNodeName.trim() || `Node-${Math.floor(Math.random() * 1000)}`;
    onCreateServer(name);
    setIsDeployModalOpen(false);
    setNewNodeName('');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white">Uncapped Nodes</h1>
        <p className="text-neutral-500 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">Zero-Limit Compute Framework</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {servers.map(server => (
          <div 
            key={server.id}
            onClick={() => onSelectServer(server)}
            className="group relative bg-[#080808] border border-white/5 rounded-[2.5rem] p-8 active:scale-[0.97] transition-all hover:border-white/20 hover:bg-[#0c0c0c] cursor-pointer shadow-2xl"
          >
            <div className="flex items-start justify-between mb-8">
               <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                  <svg className="w-7 h-7 text-neutral-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </div>
               <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${server.status === ServerStatus.RUNNING ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-neutral-800 text-neutral-500 border-white/10'}`}>
                 {server.status}
               </div>
            </div>

            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">{server.name}</h3>
            <p className="text-[10px] font-mono text-neutral-600 font-bold tracking-[0.15em] mb-10 uppercase">{server.id}</p>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/[0.03]">
               <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase text-neutral-600 tracking-widest block">CPU Usage</span>
                  <span className="text-sm font-mono font-black text-neutral-200 tracking-tighter">{(server.usage?.cpu || 0).toFixed(2)}vC</span>
               </div>
               <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase text-neutral-600 tracking-widest block">Memory</span>
                  <span className="text-sm font-mono font-black text-neutral-200 tracking-tighter">{server.usage?.ram || 0} MB</span>
               </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500">Uncapped Resources Enabled</span>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setIsDeployModalOpen(true)}
          className="w-full h-48 md:h-full border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-neutral-700 hover:text-white hover:border-white/20 transition-all active:scale-[0.98] bg-transparent"
        >
           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Deploy New Node</span>
        </button>
      </div>

      {/* Deployment Modal */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setIsDeployModalOpen(false)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 w-full max-w-md shadow-[0_0_100px_rgba(79,70,229,0.1)] animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center">
                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Deploy Node</h3>
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Provisioning Layer 2 Instance</p>
              </div>
            </div>

            <form onSubmit={handleDeploy} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Instance Designation</label>
                <input 
                  autoFocus
                  required
                  type="text"
                  placeholder="e.g. Production-API-01"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl p-5 text-sm font-mono text-white outline-none focus:border-indigo-500 transition-all shadow-inner placeholder:text-neutral-800"
                />
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Resource Plan</span>
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Uncapped</span>
                </div>
                <p className="text-[8px] font-bold text-neutral-700 uppercase leading-relaxed">Automatic scaling enabled. Node will be assigned a unique dynamic port and dedicated binary volume.</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsDeployModalOpen(false)}
                  className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-neutral-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Abort
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
                >
                  Confirm Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
