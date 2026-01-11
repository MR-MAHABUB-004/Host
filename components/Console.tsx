
import React, { useState, useEffect, useRef } from 'react';
import { BotServer, ServerStatus } from '../types';

interface ConsoleProps {
  server: BotServer;
}

export const Console: React.FC<ConsoleProps> = ({ server }) => {
  const [logs, setLogs] = useState<{ text: string, type: 'info' | 'error' | 'success' | 'output' }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLogs([
      { text: `[SYSTEM] Booting instance ${server.id}...`, type: 'info' },
      { text: `[DOCKER] Attaching to container logs...`, type: 'info' },
      { text: `[SYSTEM] Log stream established.`, type: 'success' },
      { text: `--------------------------------------------------------------------------------`, type: 'info' }
    ]);
    
    if (server.status === ServerStatus.RUNNING) {
      const interval = setInterval(() => {
        const timestamp = new Date().toLocaleTimeString();
        const mockLogs = [
          `[${timestamp}] [INFO] Request received from ::ffff:127.0.0.1`,
          `[${timestamp}] [DEBUG] Processing message bundle...`,
          `[${timestamp}] [INFO] Database query executed in 12ms`,
          `[${timestamp}] [EVENT] Shard #0 heartbeat received`,
          `[${timestamp}] [WARN] Memory usage approaching 80% threshold`
        ];
        
        if (Math.random() > 0.4) {
          const logText = mockLogs[Math.floor(Math.random() * mockLogs.length)];
          setLogs(prev => [...prev, { 
            text: logText, 
            type: logText.includes('WARN') ? 'error' : 'output' 
          }].slice(-500));
        }
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setLogs(prev => [...prev, { text: "[SYSTEM] Instance is offline. No active logs.", type: 'info' }]);
    }
  }, [server.id, server.status]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#010409]">
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500/80"></div>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Log Viewer</span>
        </div>
        <button onClick={() => setLogs([])} className="text-[9px] text-slate-500 hover:text-white transition-colors font-bold tracking-widest">CLEAR</button>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 font-mono text-[11px] md:text-[12px] leading-relaxed scroll-smooth"
      >
        {logs.map((log, i) => (
          <div key={i} className={`whitespace-pre-wrap break-all mb-0.5 ${
            log.type === 'error' ? 'text-rose-400' : 
            log.type === 'success' ? 'text-emerald-400' : 
            log.type === 'info' ? 'text-slate-500 italic' : 'text-slate-300'
          }`}>
            {log.text}
          </div>
        ))}
      </div>

      <div className="px-4 py-1.5 border-t border-slate-800/50 bg-[#0d1117] flex justify-between items-center shrink-0">
        <span className="text-[8px] text-slate-600 font-mono uppercase">Buffer: 500 lines</span>
        <span className="text-[8px] text-slate-600 font-mono uppercase">TTY/LOGS</span>
      </div>
    </div>
  );
};
