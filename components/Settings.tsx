
import React, { useState } from 'react';
import { BotServer } from '../types';

interface SettingsProps {
  server: BotServer;
  onUpdateSettings: (startupCommand: string, mainFile: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ server, onUpdateSettings }) => {
  const [startup, setStartup] = useState(server.startupCommand);
  const [mainFile, setMainFile] = useState(server.mainFile);
  const [isSaved, setIsSaved] = useState(false);

  const handleUpdate = () => {
    onUpdateSettings(startup, mainFile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8 custom-scrollbar overflow-y-auto h-full">
      <section className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-800 bg-[#1c2128]">
          <h3 className="text-lg font-bold text-white">Startup Configuration</h3>
          <p className="text-sm text-slate-400 mt-1">Define how your bot instance starts up within the container.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Startup Command</label>
            <input 
              type="text" 
              value={startup}
              onChange={(e) => setStartup(e.target.value)}
              className="w-full bg-black border border-slate-700 rounded-lg p-3 text-sm font-mono text-white outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g., npm start"
            />
            <p className="text-[10px] text-slate-500">This command will be executed in the shell inside your Docker container.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Entrypoint File</label>
            <input 
              type="text" 
              value={mainFile}
              onChange={(e) => setMainFile(e.target.value)}
              className="w-full bg-black border border-slate-700 rounded-lg p-3 text-sm font-mono text-white outline-none focus:border-indigo-500 transition-colors"
              placeholder="index.js"
            />
          </div>

          <button 
            onClick={handleUpdate}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              isSaved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {isSaved ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                SETTINGS SAVED
              </>
            ) : 'UPDATE SETTINGS'}
          </button>
        </div>
      </section>

      <section className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-800 bg-[#1c2128]">
          <h3 className="text-lg font-bold text-white">Resource Allocation</h3>
          <p className="text-sm text-slate-400 mt-1">These limits are enforced by the host Docker daemon.</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-black/40 rounded-lg border border-slate-800">
            <p className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">CPU Cores</p>
            <p className="text-xl font-bold text-white">{server.limits.cpu} Core</p>
          </div>
          <div className="p-4 bg-black/40 rounded-lg border border-slate-800">
            <p className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">Memory (RAM)</p>
            <p className="text-xl font-bold text-white">{server.limits.ram} MB</p>
          </div>
          <div className="p-4 bg-black/40 rounded-lg border border-slate-800">
            <p className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">Disk Storage</p>
            <p className="text-xl font-bold text-white">{server.limits.disk} GB</p>
          </div>
        </div>
      </section>
      
      <div className="flex justify-end pt-4">
        <button 
          onClick={() => alert('Server reinstallation queued...')}
          className="px-6 py-2 text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm font-bold transition-all uppercase tracking-wide"
        >
          Reinstall Server
        </button>
      </div>
    </div>
  );
};
