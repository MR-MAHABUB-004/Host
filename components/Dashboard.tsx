
import React, { useState } from 'react';
import { BotServer, ServerStatus } from '../types';

interface DashboardProps {
  servers: BotServer[];
  onSelectServer: (server: BotServer) => void;
  onCreateServer: (name: string, startupCommand: string, mainFile: string) => void;
  currentUser: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ servers, onSelectServer, onCreateServer, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStartup, setNewStartup] = useState('node index.js');
  const [newMainFile, setNewMainFile] = useState('index.js');

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onCreateServer(newName, newStartup, newMainFile);
      setNewName('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-12 pb-24 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Active Instances" value={servers.filter(s => s.status === ServerStatus.RUNNING).length.toString()} color="emerald" />
        <StatCard label="Load Distribution" value={`${servers.reduce((acc, s) => acc + (s.status === ServerStatus.RUNNING ? s.usage.cpu : 0), 0).toFixed(2)} Cores`} color="indigo" />
        <StatCard label="RAM Allocation" value={`${servers.reduce((acc, s) => acc + (s.status === ServerStatus.RUNNING ? s.usage.ram : 0), 0)} MB`} color="indigo" />
        <StatCard label="System Health" value="OPTIMAL" color="amber" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-800/60 pb-6">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Resource Management</h3>
          <p className="text-xs text-slate-500 mt-1">Monitor and manage your high-performance container clusters.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all text-sm font-bold flex items-center gap-2 shadow-xl shadow-indigo-500/30 active:scale-95 uppercase tracking-widest"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Deploy New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {servers.map(server => (
          <div 
            key={server.id}
            onClick={() => onSelectServer(server)}
            className="group cursor-pointer bg-[#161b22] border border-slate-800 hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-500/5 rounded-3xl p-8 transition-all duration-300 flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all shadow-inner">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className={`px-3 py-1 rounded-xl text-[10px] font-extrabold tracking-widest uppercase border ${
                server.status === ServerStatus.RUNNING ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {server.status}
              </span>
            </div>
            
            <h4 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{server.name}</h4>
            <div className="flex items-center gap-2 mb-4">
               <span className="text-[10px] font-mono text-slate-600 uppercase font-bold tracking-tighter bg-slate-800/40 px-2 py-0.5 rounded">{server.id}</span>
               <span className="text-slate-700">•</span>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{server.owner.split('@')[0]}</span>
            </div>

            <div className="mb-6 flex items-center gap-2.5 bg-black/30 p-2 rounded-xl border border-slate-800/40">
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
               <a 
                 href={server.liveUrl} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 onClick={(e) => e.stopPropagation()}
                 className="text-[10px] font-mono text-slate-400 hover:text-indigo-400 truncate block flex-1 transition-colors"
               >
                 {server.liveUrl.replace('http://', '')}
               </a>
               <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </div>

            <div className="space-y-5 mt-auto">
              <div className="bg-slate-800/20 p-3 rounded-2xl border border-slate-800/40">
                <div className="flex justify-between text-[9px] mb-2">
                  <span className="text-slate-500 uppercase font-bold tracking-widest">CPU Compute</span>
                  <span className="text-indigo-400 font-bold">{Math.round((server.usage.cpu / server.limits.cpu) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                    style={{ width: `${(server.usage.cpu / server.limits.cpu) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-800/20 p-3 rounded-2xl border border-slate-800/40">
                <div className="flex justify-between text-[9px] mb-2">
                  <span className="text-slate-500 uppercase font-bold tracking-widest">RAM Allocation</span>
                  <span className="text-emerald-400 font-bold">{server.usage.ram}MB / {server.limits.ram}MB</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                    style={{ width: `${(server.usage.ram / server.limits.ram) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#161b22] border border-slate-700/50 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 py-8 border-b border-slate-800/60 bg-[#1c2128] flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Instance Builder
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-10">
              <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Instance Alias</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-black/60 border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-800"
                    placeholder="e.g. Production Musician"
                    autoFocus
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Startup Binary</label>
                    <input 
                      type="text" 
                      value={newStartup}
                      onChange={(e) => setNewStartup(e.target.value)}
                      className="w-full bg-black/60 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">EntryPoint</label>
                    <input 
                      type="text" 
                      value={newMainFile}
                      onChange={(e) => setNewMainFile(e.target.value)}
                      className="w-full bg-black/60 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
                  <p className="text-[10px] text-indigo-400/60 uppercase font-black mb-2 tracking-[0.2em]">Default Tier Allocation</p>
                  <ul className="text-[11px] text-slate-400 space-y-2">
                     <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> 1 Dedicated CPU Core</li>
                     <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> 512MB RAM In-Memory Cache</li>
                     <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> 5GB SSD High-Speed Storage</li>
                  </ul>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] text-sm font-black shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Deploy Container
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="bg-[#161b22] border border-slate-800/60 p-8 rounded-3xl shadow-xl shadow-black/5 hover:border-slate-700 transition-all group">
    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3 group-hover:text-indigo-400 transition-colors">{label}</p>
    <p className="text-3xl font-black text-white tracking-tight">{value}</p>
  </div>
);
