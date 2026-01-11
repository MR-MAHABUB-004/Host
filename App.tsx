
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ServerView } from './components/ServerView';
import { AdminPanel } from './components/AdminPanel';
import { Login } from './components/Login';
import { BotServer, ViewType, ServerStatus, FileEntry, User } from './types';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '@mahabub#45';
const HOST_IP = '157.173.120.35';

// Helper to generate a random port
const generateRandomPort = () => Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024;

const createInitialServer = (): BotServer => {
  const port = generateRandomPort();
  return {
    id: 'srv-001',
    name: 'Primary Node',
    owner: ADMIN_USERNAME,
    status: ServerStatus.RUNNING,
    limits: { cpu: 0, ram: 0, disk: 0 },
    usage: { cpu: 0.12, ram: 102, disk: 0.8 },
    startupCommand: 'npm start',
    mainFile: 'index.js',
    port: port,
    liveUrl: `http://${HOST_IP}:${port}`,
    files: [
       { name: 'index.js', path: '/index.js', type: 'file', lastModified: 'Nov 22, 2023', content: 'console.log("NexusNode active.");' },
       { name: 'src', path: '/src', type: 'directory', lastModified: 'Nov 22, 2023' }
    ]
  };
};

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('nexus_user'));
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  
  // Manage authorized users state with User objects
  const [authorizedUsers, setAuthorizedUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('nexus_authorized_users_v2');
    const defaultAdmin: User = { username: ADMIN_USERNAME, passwordHash: ADMIN_PASSWORD };
    
    if (saved) {
      const parsed: User[] = JSON.parse(saved);
      // Ensure admin is always included with correct credentials
      const adminExists = parsed.some(u => u.username === ADMIN_USERNAME);
      if (!adminExists) return [defaultAdmin, ...parsed];
      
      // Update admin password if it's different (enforce hardcoded credentials)
      return parsed.map(u => u.username === ADMIN_USERNAME ? defaultAdmin : u);
    }
    return [defaultAdmin];
  });

  const [servers, setServers] = useState<BotServer[]>(() => {
    const saved = localStorage.getItem('nexus_servers_v8');
    return saved ? JSON.parse(saved) : [createInitialServer()];
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('nexus_servers_v8', JSON.stringify(servers));
  }, [servers]);

  useEffect(() => {
    localStorage.setItem('nexus_authorized_users_v2', JSON.stringify(authorizedUsers));
  }, [authorizedUsers]);

  const selectedServer = useMemo(() => {
    return servers.find(s => s.id === selectedServerId) || null;
  }, [servers, selectedServerId]);

  const handleLogin = (username: string) => {
    setUser(username);
    localStorage.setItem('nexus_user', username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexus_user');
    setSelectedServerId(null);
    setCurrentView('DASHBOARD');
  };

  const navigateToServer = (server: BotServer) => {
    setSelectedServerId(server.id);
    setCurrentView('CONSOLE');
    setIsSidebarOpen(false);
  };

  const handleDeleteServer = (id: string) => {
    setServers(prev => prev.filter(s => s.id !== id));
    setSelectedServerId(null);
    setCurrentView('DASHBOARD');
  };

  if (!user) return <Login onLogin={handleLogin} authorizedUsers={authorizedUsers} />;

  const isAdmin = user === ADMIN_USERNAME;
  const visibleServers = isAdmin ? servers : servers.filter(s => s.owner === user);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-black text-white selection:bg-indigo-500/40">
      <div className={`fixed inset-0 z-[60] transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <div className={`absolute inset-y-0 left-0 w-[280px] bg-[#080808] border-r border-white/5 transform transition-transform duration-300 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <Sidebar 
            currentView={currentView} 
            onNavigate={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} 
            onSelectServer={() => { setSelectedServerId(null); setIsSidebarOpen(false); }}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      <div className="hidden md:block w-64 shrink-0 bg-[#080808] border-r border-white/5">
        <Sidebar 
          currentView={currentView} 
          onNavigate={setCurrentView} 
          onSelectServer={() => setSelectedServerId(null)}
          isAdmin={isAdmin}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
        <header className="sticky top-0 z-50 shrink-0 h-16 md:h-20 pro-glass border-b border-white/5 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 active:scale-90 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h8m-8 6h16" /></svg>
            </button>
            <div className="flex items-center gap-1.5 md:gap-2 text-sm md:text-base font-bold truncate">
               <span className="text-neutral-500 font-medium">Nexus</span>
               <span className="text-neutral-800">/</span>
               <span className="truncate uppercase tracking-tight text-neutral-100">{selectedServer ? selectedServer.name : currentView}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center hover:bg-neutral-800 transition-colors">
            <span className="text-[10px] font-black text-white">{user.charAt(0).toUpperCase()}</span>
          </button>
        </header>

        <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
          {currentView === 'DASHBOARD' && (
            <Dashboard 
              servers={visibleServers} 
              onSelectServer={navigateToServer} 
              onCreateServer={() => {}} 
              currentUser={user}
            />
          )}

          {['CONSOLE', 'SHELL', 'FILE_MANAGER', 'SETTINGS'].includes(currentView) && selectedServer && (
            <ServerView 
              server={selectedServer} 
              view={currentView}
              setView={setCurrentView}
              onAction={(id, act) => {
                setServers(prev => prev.map(s => s.id === id ? { ...s, status: act === 'START' || act === 'RESTART' ? ServerStatus.RUNNING : ServerStatus.STOPPED } : s));
              }}
              onUpdateFiles={(id, files) => setServers(prev => prev.map(s => s.id === id ? { ...s, files } : s))}
              onUpdateSettings={(id, cmd, file) => setServers(prev => prev.map(s => s.id === id ? { ...s, startupCommand: cmd, mainFile: file } : s))}
              onDeleteServer={handleDeleteServer}
            />
          )}

          {currentView === 'ADMIN' && isAdmin && (
            <AdminPanel 
              servers={servers} 
              setServers={setServers} 
              authorizedUsers={authorizedUsers} 
              setAuthorizedUsers={setAuthorizedUsers}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
