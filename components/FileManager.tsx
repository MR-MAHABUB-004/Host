
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { BotServer, FileEntry } from '../types';

interface FileManagerProps {
  server: BotServer;
  onUpdateFiles: (files: FileEntry[]) => void;
}

export const FileManager: React.FC<FileManagerProps> = ({ server, onUpdateFiles }) => {
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null);
  
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [deletingPath, setDeletingPath] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPath && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingPath]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeContextMenu && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeContextMenu]);

  const visibleFiles = useMemo(() => {
    return server.files.filter(file => {
      const lastSlash = file.path.lastIndexOf('/');
      const parentPath = lastSlash === 0 ? '/' : file.path.substring(0, lastSlash);
      return parentPath === (currentPath === '/' ? '/' : currentPath);
    });
  }, [server.files, currentPath]);

  const selectedFile = useMemo(() => {
    return server.files.find(f => f.path === selectedFilePath) || null;
  }, [server.files, selectedFilePath]);

  const handleItemClick = (file: FileEntry) => {
    if (editingPath) return;
    if (file.type === 'directory') {
      setCurrentPath(file.path);
    } else {
      setSelectedFilePath(file.path);
      setEditContent(file.content || '');
    }
    setActiveContextMenu(null);
  };

  const navigateUp = () => {
    if (currentPath === '/') return;
    const lastSlash = currentPath.lastIndexOf('/');
    const parent = currentPath.substring(0, lastSlash) || '/';
    setCurrentPath(parent);
    setActiveContextMenu(null);
    setEditingPath(null);
  };

  const handleSaveFile = () => {
    if (!selectedFilePath) return;
    const newFiles = server.files.map(f => {
      if (f.path === selectedFilePath) {
        return { ...f, content: editContent, lastModified: new Date().toLocaleString() };
      }
      return f;
    });
    onUpdateFiles(newFiles);
    alert('SUCCESS: File changes committed to node.');
  };

  const startRename = (e: React.MouseEvent, file: FileEntry) => {
    e.stopPropagation();
    setEditingPath(file.path);
    setTempName(file.name);
    setActiveContextMenu(null);
  };

  const confirmRename = () => {
    if (!editingPath || !tempName.trim()) {
      setEditingPath(null);
      return;
    }

    const file = server.files.find(f => f.path === editingPath);
    if (!file || tempName === file.name) {
      setEditingPath(null);
      return;
    }

    const parent = editingPath.substring(0, editingPath.lastIndexOf('/')) || '/';
    const newPath = parent === '/' ? `/${tempName}` : `${parent}/${tempName}`;
    
    if (server.files.some(f => f.path === newPath)) {
      alert('ERROR: File name conflict detected.');
      return;
    }

    const newFiles = server.files.map(f => {
      if (f.path === editingPath) {
        return { ...f, name: tempName, path: newPath };
      }
      if (file.type === 'directory' && f.path.startsWith(editingPath + '/')) {
        const relativePart = f.path.substring(editingPath.length);
        return { ...f, path: newPath + relativePart };
      }
      return f;
    });

    onUpdateFiles(newFiles);
    if (selectedFilePath === editingPath) setSelectedFilePath(newPath);
    if (selectedFilePath?.startsWith(editingPath + '/')) {
      setSelectedFilePath(newPath + selectedFilePath.substring(editingPath.length));
    }
    setEditingPath(null);
  };

  const startDelete = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    setDeletingPath(path);
    setActiveContextMenu(null);
  };

  const confirmDelete = () => {
    if (!deletingPath) return;
    const file = server.files.find(f => f.path === deletingPath);
    
    const newFiles = server.files.filter(f => {
      if (f.path === deletingPath) return false;
      if (file?.type === 'directory' && f.path.startsWith(deletingPath + '/')) return false;
      return true;
    });
    
    onUpdateFiles(newFiles);
    if (selectedFilePath === deletingPath || (file?.type === 'directory' && selectedFilePath?.startsWith(deletingPath + '/'))) {
      setSelectedFilePath(null);
      setEditContent('');
    }
    setDeletingPath(null);
  };

  const handleDownload = (e: React.MouseEvent, file: FileEntry) => {
    e.stopPropagation();
    const blob = new Blob([file.content || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    setActiveContextMenu(null);
  };

  const createNewFile = () => {
    const name = `new_file_${Math.floor(Math.random() * 1000)}.js`;
    const newPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
    const newFile: FileEntry = { 
      name, 
      path: newPath, 
      type: 'file', 
      lastModified: new Date().toLocaleString(), 
      content: '' 
    };
    onUpdateFiles([...server.files, newFile]);
    setEditingPath(newPath);
    setTempName(name);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-8 min-h-0 overflow-hidden bg-transparent p-6">
      {/* File Sidebar - Left Pane */}
      <div className="w-full md:w-80 lg:w-96 bg-[#161b22]/60 border border-white/5 rounded-[2rem] flex flex-col overflow-hidden shrink-0 h-1/2 md:h-full shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-[#1c2128]/30">
          <div className="flex items-center justify-between mb-6">
            <div className="min-w-0">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Workspace</span>
              <span className="text-xs font-mono text-indigo-400 truncate block bg-black/60 px-3 py-1.5 rounded-xl border border-white/5">{currentPath}</span>
            </div>
            <button onClick={navigateUp} className={`p-3 bg-slate-800/80 hover:bg-slate-700 rounded-2xl text-slate-400 transition-all active:scale-90 ${currentPath === '/' ? 'opacity-20 pointer-events-none' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => fileInputRef.current?.click()} className="py-3 bg-slate-800/60 border border-white/5 hover:bg-slate-700/80 rounded-2xl text-[10px] font-black text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95 uppercase tracking-widest">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Push
            </button>
            <button onClick={createNewFile} className="py-3 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 rounded-2xl text-[10px] font-black text-indigo-400 flex items-center justify-center gap-2 transition-all active:scale-95 uppercase tracking-widest">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              New
            </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
             const file = e.target.files?.[0];
             if (file) {
               const reader = new FileReader();
               reader.onload = (ev) => {
                 const p = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
                 onUpdateFiles([...server.files.filter(f => f.path !== p), { name: file.name, path: p, type: 'file', lastModified: new Date().toLocaleString(), content: ev.target?.result as string || '' }]);
               };
               reader.readAsText(file);
             }
          }} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar pb-24">
          {visibleFiles.map(file => (
            <div key={file.path} className="relative group/row">
              <div 
                onClick={() => handleItemClick(file)}
                className={`flex items-center justify-between px-5 py-5 rounded-2xl text-sm border transition-all ${selectedFilePath === file.path ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 shadow-[0_8px_24px_rgba(99,102,241,0.1)]' : 'text-slate-400 border-transparent hover:bg-white/5 hover:border-white/10'}`}
              >
                <div className="flex items-center gap-5 truncate flex-1 min-w-0">
                  {file.type === 'directory' ? (
                    <div className="w-6 h-6 shrink-0 text-amber-500/80"><svg fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg></div>
                  ) : (
                    <div className="w-6 h-6 shrink-0 text-slate-500"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
                  )}
                  
                  {editingPath === file.path ? (
                    <input 
                      ref={editInputRef}
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
                      onBlur={confirmRename}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-black/80 border border-indigo-500/50 rounded-xl px-3 py-2 text-white text-xs font-mono outline-none w-full shadow-inner"
                    />
                  ) : (
                    <span className="truncate font-bold tracking-tight text-xs uppercase">{file.name}</span>
                  )}
                </div>
                
                {!editingPath && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveContextMenu(activeContextMenu === file.path ? null : file.path); }}
                    className="p-2.5 hover:bg-slate-700/50 rounded-xl transition-all opacity-0 group-hover/row:opacity-100 active:scale-90"
                  >
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                  </button>
                )}
              </div>

              {activeContextMenu === file.path && (
                <div ref={menuRef} className="absolute right-0 top-16 w-60 bg-[#1c2128] border border-white/10 rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.6)] z-[100] py-3 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                  <button onClick={(e) => startRename(e, file)} className="w-full text-left px-5 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-white/5 text-slate-200 flex items-center gap-4 transition-colors">
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> Rename
                  </button>
                  {file.type === 'file' && (
                    <button onClick={(e) => handleDownload(e, file)} className="w-full text-left px-5 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-white/5 text-slate-200 flex items-center gap-4 transition-colors">
                      <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Local Save
                    </button>
                  )}
                  <div className="h-px bg-white/5 my-2 mx-4"></div>
                  <button onClick={(e) => startDelete(e, file.path)} className="w-full text-left px-5 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-rose-500/10 text-rose-500 flex items-center gap-4 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Purge
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor Panel - Right Pane */}
      <div className="flex-1 bg-[#010409]/90 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col min-h-0 h-1/2 md:h-full shadow-2xl relative">
        {selectedFilePath && selectedFile ? (
          <>
            <div className="px-8 py-6 bg-[#1c2128]/30 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-5 truncate">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] block mb-1">In-Memory Buffer</span>
                  <span className="text-xs font-mono text-white truncate block font-bold">{selectedFilePath}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setSelectedFilePath(null)} className="px-5 py-2.5 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all">Abort</button>
                <button onClick={handleSaveFile} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all uppercase tracking-widest">Commit Changes</button>
              </div>
            </div>
            <textarea 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 bg-transparent text-indigo-200/90 p-10 font-mono text-sm outline-none resize-none leading-relaxed custom-scrollbar selection:bg-indigo-500/30"
              spellCheck={false}
              autoFocus
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-center bg-transparent">
            <div className="w-28 h-28 bg-white/5 border border-white/10 rounded-[3rem] flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <svg className="w-14 h-14 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h4 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">Cloud Terminal Editor</h4>
            <p className="text-[11px] text-slate-500 max-w-sm leading-loose mx-auto uppercase tracking-widest font-bold">Initialize a coding session by selecting an asset from the file tree. Your work is isolated to this cluster.</p>
            <div className="mt-12 flex gap-6">
               <div className="px-4 py-2 bg-white/5 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5">V8 Runtime</div>
               <div className="px-4 py-2 bg-white/5 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5">Py3 Engine</div>
            </div>
          </div>
        )}

        {deletingPath && (
          <div className="absolute inset-0 z-[200] flex items-center justify-center p-8 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="bg-[#1c2128]/80 border border-white/10 rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 text-center">
              <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-500/10">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">Destructive Action</h3>
              <p className="text-[11px] text-slate-500 mb-10 leading-loose uppercase tracking-widest px-6">Confirming the removal of <span className="text-rose-400 font-mono font-black break-all">{deletingPath.split('/').pop()}</span>. This will be erased from the node disk permanently.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeletingPath(null)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-rose-500/20">Execute</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
