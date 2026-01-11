
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (username: string) => void;
  authorizedUsers: User[];
}

export const Login: React.FC<LoginProps> = ({ onLogin, authorizedUsers }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetUser = authorizedUsers.find(u => 
      u.username === username.trim() && 
      u.passwordHash === password
    );

    if (targetUser) {
      onLogin(targetUser.username);
    } else {
      setError('Invalid username or password. Access restricted to authorized personnel.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] p-4 font-sans">
      <div className="w-full max-w-md bg-[#161b22] border border-slate-800 rounded-3xl shadow-2xl p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
        {/* Decorative Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/10 blur-[80px] rounded-full"></div>

        <div className="text-center space-y-2 relative z-10">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-6 group hover:scale-105 transition-transform cursor-pointer">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">NexusNode || Mahabub Rahman</h1>
          <p className="text-slate-400 text-sm italic font-mono uppercase tracking-widest text-[10px]">
            Enterprise Hosting service..
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-bold py-3 px-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 uppercase tracking-tight">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">User Identity</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-black/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Key</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002-2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-black/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/20 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 uppercase tracking-[0.2em]"
          >
            ENTER
          </button>
        </form>

        <div className="text-center pt-4 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            RESTRICTED ACCESS PANEL<br/>
            Authorized Credentials Only
          </p>
        </div>
      </div>
    </div>
  );
};
