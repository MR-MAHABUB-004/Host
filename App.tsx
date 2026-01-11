
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ServerView } from './components/ServerView';
import { AdminPanel } from './components/AdminPanel';
import { Login } from './components/Login';
import { BotServer, ViewType, ServerStatus, FileEntry } from './types';

const ADMIN_EMAIL = 'xyzmahabub22@gmail.com';
const MOCK_DOMAIN = 'nexus-node.io';

const DEFAULT_FILES: FileEntry[] = [
  { name: 'index.js', path: '/index.js', type: 'file', size: 1024, lastModified: '2023-11-20 11:30', content: 'console.log("NexusNode Instance Running...");' },
  { name: 'package.json', path: '/package.json', type: 'file', size: 512, lastModified: '2023-11-20 09:15', content: '{\n  "name": "nexus-bot",\n  "version": "1.0.0"\n}' },
  { name: 'src', path: '/src', type: 'directory', lastModified: '2023-11-20 10:00' },
];

const INITIAL_SERVERS: BotServer[] = [
  {
    id: 'srv-001',
    name: 'Main Discord Bot',
    owner: ADMIN_EMAIL,
    status: ServerStatus.RUNNING,
    limits: { cpu: 1, ram: 512, disk: 5 },
    usage: { cpu: 0.15, ram: 124, disk: 1.2 },
    startupCommand: 'node index.js',
    mainFile: 'index.js',
    port: 3001,
    liveUrl: `http://${MOCK_DOMAIN}:3001`,
    files: [...DEFAULT_FILES]
  },
  {
    id: 'srv-002',
    name: 'Python Music Bot',
    owner: 'user_dev@nexus.io',
    status: ServerStatus.STOPPED,
    limits: { cpu: 2, ram: 1024, disk: 10 },
    usage: { cpu: 0, ram: 0, disk: 4.5 },
    startupCommand: 'python3 main.py',
    mainFile: 'main.py',
    port: 3002,
    liveUrl: `http://${MOCK_DOMAIN}:3002`,
    files: [
      { name: 'main.py', path: '/main.py', type: 'file', size: 800, lastModified: '2023-11-21 08:00', content: 'print("Python bot ready.")' }
    ]
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('nexus_user'));
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [servers, setServers] = useState<BotServer[]>(INITIAL_SERVERS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const selectedServer = useMemo(() => {
    return servers.find(s => s.id === selectedServerId) || null;
  }, [servers, selectedServerId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = (email: string) => {
    setUser(email);
    localStorage.setItem('nexus_user', email);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexus_user');
    setSelectedServerId(null);
    setCurrentView('DASHBOARD');
    setIsProfileOpen(false);
  };

  const handleServerAction = (serverId: string, action: 'START' | 'STOP' | 'RESTART') => {
    setServers(prev => prev.map(s => {
      if (s.id !== serverId) return s;
      if (action === 'START') return { ...s, status: ServerStatus.RUNNING };
      if (action === 'STOP') return { ...s, status: ServerStatus.STOPPED };
      if (action === 'RESTART') return { ...s, status: ServerStatus.RUNNING };
      return s;
    }));
  };

  const handleUpdateFiles = (serverId: string, newFiles: FileEntry[]) => {
    setServers(prev => prev.map(s => s.id === serverId ? { ...s, files: newFiles } : s));
  };

  const handleUpdateSettings = (serverId: string, startupCommand: string, mainFile: string) => {
    setServers(prev => prev.map(s => s.id === serverId ? { ...s, startupCommand, mainFile } : s));
  };

  const navigateToServer = (server: BotServer) => {
    setSelectedServerId(server.id);
    setCurrentView('CONSOLE');
    setIsSidebarOpen(false);
  };

  const handleCreateServer = (name: string, startupCommand: string, mainFile: string) => {
    const randomPort = Math.floor(Math.random() * (9000 - 3000 + 1)) + 3000;
    const newServer: BotServer = {
      id: `srv-${Math.floor(1000 + Math.random() * 8999)}`,
      name,
      owner: user || '',
      status: ServerStatus.STOPPED,
      limits: { cpu: 1, ram: 512, disk: 5 },
      usage: { cpu: 0, ram: 0, disk: 0 },
      startupCommand,
      mainFile,
      port: randomPort,
      liveUrl: `http://${MOCK_DOMAIN}:${randomPort}`,
      files: [...DEFAULT_FILES]
    };
    setServers(prev => [...prev, newServer]);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = user === ADMIN_EMAIL;
  const visibleServers = isAdmin ? servers : servers.filter(s => s.owner === user);
  const serverDetailViews: ViewType[] = ['CONSOLE', 'SHELL', 'FILE_MANAGER', 'SETTINGS'];

  return (
    <div className="flex h-screen w-screen bg-[#0b0e14] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar - fixed on mobile, relative on desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          currentView={currentView} 
          onNavigate={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} 
          onSelectServer={() => { setSelectedServerId(null); setIsSidebarOpen(false); }}
          isAdmin={isAdmin}
        />
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-md" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Subtle top-light gradient */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
        
        <header className="h-20 flex items-center justify-between px-6 md:px-12 shrink-0 z-20">
          <div className="flex items-center gap-5">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 md:hidden text-slate-400 hover:text-white bg-slate-800/40 rounded-xl transition-all active:scale-90">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <div className="flex flex-col min-w-0">
              <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight truncate">
                {selectedServer ? selectedServer.name : currentView}
              </h2>
              {selectedServer && (
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${selectedServer.status === ServerStatus.RUNNING ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-rose-500'}`}></span>
                  <span className={`text-[10px] font-black tracking-widest uppercase ${selectedServer.status === ServerStatus.RUNNING ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Instance {selectedServer.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black transition-all border-2 ${isProfileOpen ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-110' : 'border-slate-800 hover:border-slate-600'} ${isAdmin ? 'bg-indigo-600' : 'bg-emerald-600'}`}
              >
                {user.charAt(0).toUpperCase()}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-4 w-80 glass-panel border border-slate-700/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="px-6 py-4 border-b border-slate-700/30">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Authenticated Entity</p>
                    <p className="text-sm text-white font-mono truncate font-bold">{user}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${isAdmin ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {isAdmin ? 'System Admin' : 'Node Owner'}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-3">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all text-xs font-black uppercase tracking-widest active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Terminate Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area - Floating Panel Effect */}
        <div className="flex-1 flex flex-col min-h-0 relative w-full overflow-hidden px-4 md:px-10 pb-4 md:pb-10">
          <div className="flex-1 flex flex-col min-h-0 bg-[#0d1117]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden relative">
            
            {/* Inner background glow */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-500/5 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-emerald-500/5 blur-[100px] pointer-events-none"></div>

            <div className="flex-1 flex flex-col min-h-0 relative z-10 overflow-hidden">
              {currentView === 'DASHBOARD' && (
                <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                  <Dashboard 
                    servers={visibleServers} 
                    onSelectServer={navigateToServer} 
                    onCreateServer={handleCreateServer}
                    currentUser={user}
                  />
                </div>
              )}

              {serverDetailViews.includes(currentView) && selectedServer && (
                <div className="flex-1 flex flex-col p-4 md:p-10 min-h-0 overflow-hidden">
                  <ServerView 
                    server={selectedServer} 
                    view={currentView}
                    setView={setCurrentView}
                    onAction={handleServerAction}
                    onUpdateFiles={handleUpdateFiles}
                    onUpdateSettings={handleUpdateSettings}
                  />
                </div>
              )}

              {currentView === 'ADMIN' && isAdmin && (
                <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                  <AdminPanel servers={servers} setServers={setServers} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
