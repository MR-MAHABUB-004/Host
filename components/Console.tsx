
import React, { useState, useEffect, useRef } from 'react';
import { BotServer, ServerStatus } from '../types';

interface ConsoleProps {
  server: BotServer;
}

type LogType = 'info' | 'error' | 'success' | 'output' | 'warn';

interface LogEntry {
  text: string;
  type: LogType;
  timestamp: string;
}

export const Console: React.FC<ConsoleProps> = ({ server }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevStatus = useRef<ServerStatus>(server.status);
  const prevMainFile = useRef<string>(server.mainFile);
  const prevFilesCount = useRef<number>(server.files.length);

  const getTS = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const addLog = (text: string, type: LogType = 'output') => {
    setLogs(prev => [...prev, { text, type, timestamp: getTS() }].slice(-100));
  };

  const checkAndRun = () => {
    if (server.status !== ServerStatus.RUNNING) return;

    // Check if main file exists in the file system
    const fileExists = server.files.some(f => 
      f.name === server.mainFile || 
      f.path === server.mainFile || 
      f.path === '/' + server.mainFile
    );

    const ext = server.mainFile.split('.').pop()?.toLowerCase();
    let runtime = 'Node.js Process';
    if (ext === 'html' || ext === 'htm') runtime = 'Static Web Server';
    if (ext === 'py') runtime = 'Python Runtime';

    addLog(`[SYSTEM] Initializing ${runtime}...`, 'info');
    addLog(`[SYSTEM] Checking for entrypoint: ${server.mainFile}`, 'info');

    setTimeout(() => {
      if (fileExists) {
        addLog(`[SYSTEM] Successfully loaded ${server.mainFile}`, 'info');
        addLog(`You're live!`, 'success');
        if (ext === 'html') {
          addLog(`[HINT] Your website is now accessible via the Live Link.`, 'output');
        }
      } else {
        addLog(`FATAL ERROR: Entrypoint file "${server.mainFile}" not found!`, 'error');
        addLog(`[FIX] Create ${server.mainFile} in File Manager to resolve this.`, 'warn');
      }
    }, 600);
  };

  useEffect(() => {
    // Handle status change
    if (prevStatus.current !== server.status) {
      if (server.status === ServerStatus.RUNNING) {
        setLogs([]); 
        checkAndRun();
      } else if (server.status === ServerStatus.STOPPED) {
        addLog(`Process terminated.`, 'warn');
      }
      prevStatus.current = server.status;
    }

    // Detect if main file changed in settings
    if (server.status === ServerStatus.RUNNING && prevMainFile.current !== server.mainFile) {
      addLog(`Entrypoint updated to ${server.mainFile}. Restarting...`, 'info');
      setLogs([]);
      checkAndRun();
      prevMainFile.current = server.mainFile;
    }

    // Detect if file was deleted while running
    if (server.status === ServerStatus.RUNNING && prevFilesCount.current !== server.files.length) {
        const fileExists = server.files.some(f => 
            f.name === server.mainFile || f.path === server.mainFile || f.path === '/' + server.mainFile
        );
        if (!fileExists) {
            addLog(`CRASH: Required file ${server.mainFile} was removed.`, 'error');
        } else if (logs.some(l => l.text.includes('FATAL ERROR'))) {
            // If it was erroring and now file exists, restart
            setLogs([]);
            checkAndRun();
        }
        prevFilesCount.current = server.files.length;
    }

  }, [server.status, server.mainFile, server.files]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#020408]">
      <div className="px-5 py-3 bg-[#080a0e] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${server.status === ServerStatus.RUNNING ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Live Console</span>
        </div>
        <button 
          onClick={() => setLogs([])}
          className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white rounded transition-all"
        >
          Flush
        </button>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 font-mono text-[12px] md:text-[14px] leading-relaxed custom-scrollbar"
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-10">
            <span className="text-[10px] uppercase tracking-[0.4em] font-black">Waiting for boot...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-[10px] text-neutral-700 select-none shrink-0 font-bold">[{log.timestamp}]</span>
                <div className={`${
                  log.type === 'error' ? 'text-rose-400 font-bold' : 
                  log.type === 'success' ? 'text-emerald-400 font-bold animate-in fade-in zoom-in-95 duration-300' : 
                  log.type === 'info' ? 'text-indigo-400' : 'text-neutral-300'
                }`}>
                  {log.text}
                </div>
              </div>
            ))}
            <div className="inline-block w-1.5 h-3.5 bg-indigo-500/50 animate-pulse ml-1"></div>
          </div>
        )}
      </div>

      <div className="px-5 py-2 bg-[#05070a] border-t border-white/5 flex justify-between items-center shrink-0">
        <span className="text-[9px] font-mono text-neutral-700 uppercase tracking-widest">Type: {server.mainFile.split('.').pop()?.toUpperCase() || 'UNKNOWN'}</span>
        <span className="text-[9px] font-mono text-neutral-700 uppercase tracking-widest">Mapping: 0.0.0.0:{server.port}</span>
      </div>
    </div>
  );
};
