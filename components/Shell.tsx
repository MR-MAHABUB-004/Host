
import React, { useState, useEffect, useRef } from 'react';
import { BotServer, ServerStatus } from '../types';

interface ShellProps {
  server: BotServer;
}

export const Shell: React.FC<ShellProps> = ({ server }) => {
  const [history, setHistory] = useState<{ text: string, type: 'cmd' | 'output' | 'error' | 'success' | 'info' }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory([
      { text: `NexusNode Interactive Terminal [Version 3.2.1-stable]`, type: 'info' },
      { text: `Welcome to the isolated container environment for: ${server.name}`, type: 'info' },
      { text: `(c) 2024 NexusNode Cloud. All rights reserved.`, type: 'info' },
      { text: `Type 'help' to see available commands.`, type: 'info' },
      { text: ``, type: 'output' }
    ]);
  }, [server.id, server.name]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isProcessing]);

  const addLine = (text: string, type: 'cmd' | 'output' | 'error' | 'success' | 'info' = 'output') => {
    setHistory(prev => [...prev, { text, type }]);
  };

  const simulateProgress = async (cmd: string) => {
    setIsProcessing(true);
    const action = cmd.includes('npm') ? 'npm' : 'pip';
    addLine(`[${action}] Initializing package manager...`, 'info');
    
    const steps = [
      `[${action}] Resolving dependencies...`,
      `[${action}] Downloading metadata...`,
      `[${action}] Extracting packages...`,
      `[${action}] Finalizing installation...`
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      addLine(step, 'info');
    }

    if (cmd.includes('express')) {
      addLine(`+ express@4.18.2`, 'success');
      addLine(`added 57 packages in 3s`, 'success');
    } else {
      addLine(`Installation successful.`, 'success');
    }
    setIsProcessing(false);
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    
    const cmd = inputValue.trim();
    addLine(`container@nexusnode:~$ ${cmd}`, 'cmd');
    setInputValue('');

    const lowerCmd = cmd.toLowerCase();
    const args = lowerCmd.split(' ');
    const baseCmd = args[0];

    if (baseCmd === 'clear') {
      setHistory([]);
      return;
    }

    if (baseCmd === 'help') {
      addLine(`Standard Container Commands:`, 'info');
      addLine(`  ls              List directory contents`, 'output');
      addLine(`  npm install     Install Node.js packages`, 'output');
      addLine(`  node <file>     Execute Javascript`, 'output');
      addLine(`  python3 <file>  Execute Python scripts`, 'output');
      addLine(`  neofetch        Display system information`, 'output');
      addLine(`  clear           Clear the terminal screen`, 'output');
      return;
    }

    if (baseCmd === 'ls') {
      addLine(`${server.mainFile}   package.json   node_modules/   src/   logs/`, 'output');
      return;
    }

    if (baseCmd === 'npm' || baseCmd === 'pip') {
      if (args[1] === 'install') {
        await simulateProgress(cmd);
      } else {
        addLine(`Usage: ${baseCmd} install <package_name>`, 'info');
      }
      return;
    }

    if (baseCmd === 'node' || baseCmd === 'python3') {
      setIsProcessing(true);
      await new Promise(r => setTimeout(r, 400));
      addLine(`[RUNTIME] Running ${args[1] || server.mainFile}...`, 'info');
      await new Promise(r => setTimeout(r, 800));
      addLine(`Hello from NexusNode! Instance ${server.id} is stable.`, 'success');
      setIsProcessing(false);
      return;
    }

    if (baseCmd === 'neofetch') {
      addLine(`      _          OS: Alpine Linux 3.18`, 'info');
      addLine(`     (_)         Host: NexusNode-Container-v2`, 'info');
      addLine(`  _ __ _ _ _     Kernel: 5.15.0-generic`, 'info');
      addLine(` | '  | | '_|    Uptime: 4 days, 12 hours`, 'info');
      addLine(` |_|_|_|_|       Shell: /bin/sh`, 'info');
      addLine(`                 CPU: ${server.limits.cpu} Core(s) Reserved`, 'info');
      addLine(`                 Memory: ${server.limits.ram}MB Allocation`, 'info');
      return;
    }

    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 150));
    addLine(`sh: command not found: ${baseCmd}`, 'error');
    setIsProcessing(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0c10]">
      {/* Shell Header */}
      <div className="px-4 py-2 bg-[#1c2128] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
          </svg>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">INTERACTIVE SHELL</span>
        </div>
        <span className="text-[8px] text-slate-600 font-mono">pts/0</span>
      </div>
      
      {/* Content Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 font-mono text-[11px] md:text-[13px] leading-relaxed custom-scrollbar"
      >
        {history.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap break-all ${
            line.type === 'cmd' ? 'text-indigo-400 mt-1 font-bold' : 
            line.type === 'error' ? 'text-rose-500' : 
            line.type === 'success' ? 'text-emerald-400' : 
            line.type === 'info' ? 'text-slate-600 italic' : 'text-slate-300'
          }`}>
            {line.text}
          </div>
        ))}
        {isProcessing && <div className="text-amber-500 animate-pulse mt-1">_</div>}
      </div>
      
      {/* Footer / Input */}
      <form onSubmit={handleCommand} className="flex border-t border-slate-800 bg-[#0d1117] shrink-0">
        <div className="flex items-center pl-4 text-indigo-500 font-mono text-xs shrink-0 font-bold">
          $
        </div>
        <input 
          type="text" 
          disabled={isProcessing}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isProcessing ? "Executing..." : "Enter command..."}
          className="flex-1 bg-transparent px-3 py-4 text-white font-mono text-xs outline-none placeholder:text-slate-700"
          spellCheck={false}
          autoComplete="off"
          autoFocus
        />
      </form>
    </div>
  );
};
