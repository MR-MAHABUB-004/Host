
import React, { useState } from 'react';
import { BotServer } from '../types';

interface SettingsProps {
  server: BotServer;
  onUpdateSettings: (startupCommand: string, mainFile: string) => void;
  onDelete: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ server, onUpdateSettings, onDelete }) => {
  const [startup, setStartup] = useState(server.startupCommand);
  const [mainFile, setMainFile] = useState(server.mainFile);
  const [isSaved, setIsSaved] = useState(false);

  const handleUpdate = () => {
    onUpdateSettings(startup, mainFile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleConfirmDelete = () => {
    if (confirm("DANGER: This action is irreversible. Are you sure?")) {
      onDelete();
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 overflow-y-auto max-h-full custom-scrollbar">
      <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 mb-6">Execution Config</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Startup Line</label>
            <input 
              type="text" 
              value={startup}
              onChange={(e) => setStartup(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs font-mono text-white outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Main Entrypoint</label>
            <input 
              type="text" 
              value={mainFile}
              onChange={(e) => setMainFile(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs font-mono text-white outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button 
            onClick={handleUpdate}
            className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isSaved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isSaved ? 'CONFIG UPDATED' : 'SAVE CHANGES'}
          </button>
        </div>
      </section>

      <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 mb-4">Container Topology</h3>
        <div className="flex items-center gap-4 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Uncapped Resources</p>
            <p className="text-[8px] font-bold text-neutral-600 uppercase mt-0.5">This container has been granted full access to host resources.</p>
          </div>
        </div>
      </section>

      <section className="bg-rose-500/[0.02] border border-rose-500/10 rounded-2xl p-6 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-rose-500 mb-1">Danger Zone</h3>
            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-tight">Permanently delete this instance and all its volumes.</p>
          </div>
          <button 
            onClick={handleConfirmDelete}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 transition-all"
          >
            Delete Server
          </button>
        </div>
      </section>
    </div>
  );
};
