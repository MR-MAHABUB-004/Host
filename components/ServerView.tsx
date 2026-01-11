
import React from 'react';
import { BotServer, ViewType, ServerStatus, FileEntry } from '../types';
import { Console } from './Console';
import { Shell } from './Shell';
import { FileManager } from './FileManager';
import { Settings } from './Settings';

interface ServerViewProps {
  server: BotServer;
  view: ViewType;
  setView: (view: ViewType) => void;
  onAction: (serverId: string, action: 'START' | 'STOP' | 'RESTART') => void;
  onUpdateFiles: (serverId: string, newFiles: FileEntry[]) => void;
  onUpdateSettings: (serverId: string, startupCommand: string, mainFile: string) => void;
  onDeleteServer: (id: string) => void;
}

export const ServerView: React.FC<ServerViewProps> = ({ server, view, setView, onAction, onUpdateFiles, onUpdateSettings, onDeleteServer }) => {
  const tabs = [
    { id: 'CONSOLE', label: 'Terminal' },
    { id: 'FILE_MANAGER', label: 'Assets' },
    { id: 'SETTINGS', label: 'Startup' },
    { id: 'SHELL', label: 'SSH' }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="bg-[#080808] border border-white/5 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-5 w-full">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 ${server.status === ServerStatus.RUNNING ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)]'}`}>
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="min-w-0 flex-1">
               <div className="flex items-center gap-3">
                 <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">{server.name}</h2>
                 <a 
                  href={server.liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors"
                  title="Visit Live Application"
                 >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                 </a>
               </div>
               <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2">
                  <span className="text-[10px] font-mono text-neutral-500 font-bold bg-neutral-900 border border-white/5 px-2 py-0.5 rounded tracking-widest">{server.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${server.status === ServerStatus.RUNNING ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${server.status === ServerStatus.RUNNING ? 'text-emerald-400' : 'text-rose-400'}`}>{server.status}</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <button 
              onClick={() => onAction(server.id, 'START')}
              disabled={server.status === ServerStatus.RUNNING}
              className={`flex-1 lg:w-32 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${server.status === ServerStatus.RUNNING ? 'bg-neutral-900 text-neutral-700' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 active:scale-95'}`}
            >
              Start
            </button>
            <button 
              onClick={() => onAction(server.id, 'STOP')}
              disabled={server.status === ServerStatus.STOPPED}
              className={`flex-1 lg:w-32 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${server.status === ServerStatus.STOPPED ? 'bg-neutral-900 text-neutral-700' : 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 active:scale-95'}`}
            >
              Stop
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
           <StatBox label="CPU Load" value={`${(server.usage.cpu).toFixed(2)}vC`} sub="UNLIMITED" />
           <StatBox label="Memory" value={`${server.usage.ram}MB`} sub="UNCAPPED" />
           <StatBox label="Storage" value={`${server.usage.disk}GB`} sub="UNLIMITED" />
           <StatBox label="Node Port" value={server.port.toString()} sub="DYNAMIC" />
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/5 overflow-x-auto no-scrollbar sticky top-16 md:top-20 pro-glass z-40 -mx-4 px-4 pt-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as ViewType)}
            className={`px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 whitespace-nowrap ${
              view === tab.id ? 'border-white text-white' : 'border-transparent text-neutral-600 hover:text-neutral-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[#080808] rounded-3xl overflow-hidden border border-white/5 min-h-[450px] flex flex-col shadow-2xl">
        {view === 'CONSOLE' && <Console server={server} />}
        {view === 'SHELL' && <Shell server={server} />}
        {view === 'FILE_MANAGER' && (
          <FileManager 
            server={server} 
            onUpdateFiles={(files) => onUpdateFiles(server.id, files)} 
          />
        )}
        {view === 'SETTINGS' && (
          <Settings 
            server={server} 
            onUpdateSettings={(cmd, file) => onUpdateSettings(server.id, cmd, file)} 
            onDelete={() => onDeleteServer(server.id)}
          />
        )}
      </div>
    </div>
  );
};

const StatBox = ({ label, value, sub }: { label: string, value: string, sub?: string }) => (
  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl group hover:border-white/10 transition-colors">
    <span className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.25em] block mb-1">{label}</span>
    <span className="text-sm md:text-lg font-mono font-black text-neutral-200 tracking-tight">{value}</span>
    {sub && <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mt-1">{sub}</span>}
  </div>
);
