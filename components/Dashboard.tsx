
import React from 'react';
import { BotServer, ServerStatus } from '../types';

interface DashboardProps {
  servers: BotServer[];
  onSelectServer: (server: BotServer) => void;
  onCreateServer: (name: string, cmd: string, main: string) => void;
  currentUser: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ servers, onSelectServer }) => {
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

        <button className="w-full h-48 md:h-full border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-neutral-700 hover:text-white hover:border-white/20 transition-all active:scale-[0.98] bg-transparent">
           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Deploy New Node</span>
        </button>
      </div>
    </div>
  );
};
