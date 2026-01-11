
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onSelectServer: () => void;
  isAdmin: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onSelectServer, isAdmin }) => {
  return (
    <aside className="w-full h-full bg-[#0a0a0a] border-r border-white/5 flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
          <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <span className="font-bold text-lg tracking-tight">NexusNode</span>
      </div>

      <nav className="space-y-1">
        <button
          onClick={() => { onNavigate('DASHBOARD'); onSelectServer(); }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${currentView === 'DASHBOARD' ? 'bg-white/10 text-white font-semibold' : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          Dashboard
        </button>
        {isAdmin && (
          <button
            onClick={() => { onNavigate('ADMIN'); onSelectServer(); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${currentView === 'ADMIN' ? 'bg-white/10 text-white font-semibold' : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            System Admin
          </button>
        )}
      </nav>

      <div className="mt-auto">
        <div className="bg-[#111] border border-white/5 rounded-lg p-4">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Network Status</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-neutral-400 font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
