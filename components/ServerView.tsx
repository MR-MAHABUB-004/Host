
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
}

export const ServerView: React.FC<ServerViewProps> = ({ server, view, setView, onAction, onUpdateFiles, onUpdateSettings }) => {
  const tabs = [
    { id: 'CONSOLE', label: 'Console' },
    { id: 'SHELL', label: 'Terminal' },
    { id: 'FILE_MANAGER', label: 'Files' },
    { id: 'SETTINGS', label: 'Startup' }
  ];

  return (
    <div className="flex-1 flex flex-col space-y-4 md:space-y-6 min-h-0">
      {/* Server Context Header */}
      <div className="bg-[#161b22] border border-slate-800 rounded-xl p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="overflow-hidden">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Public Address</p>
            <div className="flex items-center gap-2">
              <a href={server.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-indigo-400 hover:text-indigo-300 underline truncate block max-w-[180px] md:max-w-none">
                {server.liveUrl}
              </a>
              <span className="text-[9px] text-slate-600 font-mono hidden sm:inline">:{server.port}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end border-t border-slate-800 pt-3 md:border-none md:pt-0">
           <div className="text-left md:text-right">
             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ID</p>
             <p className="text-[10px] text-white font-mono">{server.id}</p>
           </div>
           <div className="text-right">
             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Node</p>
             <p className="text-[10px] text-white">US-East-01</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg overflow-x-auto no-scrollbar max-w-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as ViewType)}
              className={`px-3 md:px-4 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                view === tab.id 
                ? 'bg-slate-700 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
          <button 
            disabled={server.status === ServerStatus.RUNNING}
            onClick={() => onAction(server.id, 'START')}
            className={`py-2 px-1 md:px-4 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              server.status === ServerStatus.RUNNING ? 'bg-emerald-500/10 text-emerald-500/50' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            }`}
          >
            START
          </button>
          <button 
             onClick={() => onAction(server.id, 'RESTART')}
             className="py-2 px-1 md:px-4 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5"
          >
            REBOOT
          </button>
          <button 
            disabled={server.status === ServerStatus.STOPPED}
            onClick={() => onAction(server.id, 'STOP')}
            className={`py-2 px-1 md:px-4 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              server.status === ServerStatus.STOPPED ? 'bg-rose-500/10 text-rose-500/50' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
            }`}
          >
            STOP
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-[#0d1117] rounded-xl overflow-hidden shadow-2xl border border-slate-800">
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
          />
        )}
      </div>
    </div>
  );
};
