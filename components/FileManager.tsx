
import React, { useState, useRef, useMemo } from 'react';
import { BotServer, FileEntry } from '../types';

interface FileManagerProps {
  server: BotServer;
  onUpdateFiles: (files: FileEntry[]) => void;
}

type ModalType = 'NEW_FILE' | 'NEW_FOLDER' | 'DELETE' | 'RENAME' | null;

export const FileManager: React.FC<FileManagerProps> = ({ server, onUpdateFiles }) => {
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Custom Modal State
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [inputValue, setInputValue] = useState('');
  const [targetPath, setTargetPath] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleFiles = useMemo(() => {
    return server.files.filter(file => {
      const lastSlash = file.path.lastIndexOf('/');
      const parentPath = lastSlash === 0 ? '/' : file.path.substring(0, lastSlash);
      const normalizedCurrent = currentPath === '/' ? '/' : currentPath;
      return parentPath === normalizedCurrent;
    });
  }, [server.files, currentPath]);

  const navigateUp = () => {
    if (currentPath === '/') return;
    const lastSlash = currentPath.lastIndexOf('/');
    const parent = currentPath.substring(0, lastSlash) || '/';
    setCurrentPath(parent);
  };

  const handleSaveEditor = () => {
    if (!selectedFilePath) return;
    const newFiles = server.files.map(f => f.path === selectedFilePath ? { ...f, content: editContent, lastModified: new Date().toLocaleDateString() } : f);
    onUpdateFiles(newFiles);
    setSelectedFilePath(null);
  };

  const executeCreate = () => {
    if (!inputValue.trim()) return;
    const name = inputValue.trim();
    const path = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
    
    if (server.files.some(f => f.path === path)) {
      alert("A file or folder with this name already exists.");
      return;
    }

    const newEntry: FileEntry = {
      name,
      path,
      type: activeModal === 'NEW_FILE' ? 'file' : 'directory',
      lastModified: new Date().toLocaleDateString(),
      content: activeModal === 'NEW_FILE' ? '' : undefined,
      size: activeModal === 'NEW_FILE' ? 0 : undefined
    };

    onUpdateFiles([...server.files, newEntry]);
    closeModal();
  };

  const executeDelete = () => {
    if (!targetPath) return;
    onUpdateFiles(server.files.filter(f => f.path !== targetPath && !f.path.startsWith(targetPath + '/')));
    closeModal();
  };

  const executeRename = () => {
    if (!targetPath || !inputValue.trim()) return;
    const name = inputValue.trim();
    const newFiles = server.files.map(f => {
      if (f.path === targetPath) {
        const lastSlash = f.path.lastIndexOf('/');
        const parent = f.path.substring(0, lastSlash);
        const newPath = parent === '' ? `/${name}` : `${parent}/${name}`;
        return { ...f, name, path: newPath };
      }
      if (f.path.startsWith(targetPath + '/')) {
        const remaining = f.path.substring(targetPath.length);
        const parentOfTarget = targetPath.substring(0, targetPath.lastIndexOf('/'));
        const newBase = parentOfTarget === '' ? `/${name}` : `${parentOfTarget}/${name}`;
        return { ...f, path: newBase + remaining };
      }
      return f;
    });
    onUpdateFiles(newFiles);
    closeModal();
  };

  const closeModal = () => {
    setActiveModal(null);
    setInputValue('');
    setTargetPath(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const path = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
      
      const newEntry: FileEntry = {
        name: file.name,
        path,
        type: 'file',
        size: file.size,
        lastModified: new Date().toLocaleDateString(),
        content
      };

      const existingIndex = server.files.findIndex(f => f.path === path);
      if (existingIndex > -1) {
        const updated = [...server.files];
        updated[existingIndex] = newEntry;
        onUpdateFiles(updated);
      } else {
        onUpdateFiles([...server.files, newEntry]);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (selectedFilePath) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="h-16 flex items-center justify-between px-5 bg-[#080808] border-b border-white/10 pt-[var(--sat)]">
           <button onClick={() => setSelectedFilePath(null)} className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
             <span className="text-[10px] font-black uppercase tracking-widest text-white">Back</span>
           </button>
           <span className="text-[10px] font-mono font-black text-indigo-400 truncate max-w-[140px] px-2">{selectedFilePath.split('/').pop()}</span>
           <button onClick={handleSaveEditor} className="bg-indigo-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all">Save Changes</button>
        </div>
        <textarea 
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="flex-1 w-full bg-[#030303] p-6 md:p-10 font-mono text-sm leading-relaxed outline-none resize-none text-neutral-300 custom-scrollbar"
          spellCheck={false}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[450px] relative">
      {/* Action Modals - Moved to Fixed for global visibility */}
      {activeModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={closeModal} />
          <div className="relative bg-[#111] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeModal === 'DELETE' ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                {activeModal === 'DELETE' ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white">
                {activeModal === 'NEW_FILE' && 'New File'}
                {activeModal === 'NEW_FOLDER' && 'New Folder'}
                {activeModal === 'DELETE' && 'Delete Asset'}
                {activeModal === 'RENAME' && 'Rename Asset'}
              </h3>
            </div>
            
            {activeModal === 'DELETE' ? (
              <p className="text-xs text-neutral-500 font-bold mb-8 uppercase tracking-wide leading-relaxed">
                Confirm deletion of this asset? This will permanently remove all associated data.
              </p>
            ) : (
              <div className="mb-8">
                <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-2 ml-1">Asset Designation</p>
                <input 
                  autoFocus
                  className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm font-mono text-white outline-none focus:border-indigo-500 transition-all shadow-inner"
                  placeholder={activeModal === 'NEW_FILE' ? 'index.js' : 'folder_name'}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (activeModal === 'RENAME' ? executeRename() : executeCreate())}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-neutral-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">Cancel</button>
              <button 
                onClick={() => {
                  if (activeModal === 'DELETE') executeDelete();
                  else if (activeModal === 'RENAME') executeRename();
                  else executeCreate();
                }}
                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${activeModal === 'DELETE' ? 'bg-rose-600 text-white shadow-rose-600/20' : 'bg-indigo-600 text-white shadow-indigo-600/20'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="p-4 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-3 overflow-hidden">
           <button onClick={navigateUp} disabled={currentPath === '/'} className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 transition-all active:scale-90 ${currentPath === '/' ? 'opacity-10 pointer-events-none' : 'hover:bg-white/10'}`}>
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
           </button>
           <div className="flex flex-col min-w-0">
              <span className="text-[8px] font-black uppercase text-neutral-600 tracking-[0.3em] mb-0.5">Location</span>
              <span className="text-[10px] font-mono font-black text-neutral-300 truncate max-w-[120px] uppercase">{currentPath}</span>
           </div>
         </div>
         <div className="flex gap-2">
            <button onClick={() => setActiveModal('NEW_FOLDER')} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-neutral-400 active:scale-90 border border-white/5 hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
            </button>
            <button onClick={() => setActiveModal('NEW_FILE')} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-neutral-400 active:scale-90 border border-white/5 hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-500 border border-indigo-500/20 active:scale-90 hover:bg-indigo-600/20 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
         </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
        {visibleFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
             <svg className="w-16 h-16 text-neutral-600 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
             <p className="text-xs font-black uppercase tracking-[0.3em]">Empty Directory</p>
          </div>
        ) : (
          visibleFiles.map(file => (
            <div 
              key={file.path}
              onClick={() => {
                if (file.type === 'directory') setCurrentPath(file.path);
                else { setSelectedFilePath(file.path); setEditContent(file.content || ''); }
              }}
              className="flex items-center justify-between p-5 active:bg-white/5 hover:bg-white/[0.02] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 ${file.type === 'directory' ? 'bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-neutral-900 text-neutral-500'}`}>
                  {file.type === 'directory' ? 
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg> :
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold tracking-tight text-neutral-100 group-hover:text-white truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-black uppercase text-neutral-600 tracking-widest">{file.lastModified}</span>
                    {file.size !== undefined && file.type === 'file' && (
                      <>
                        <span className="text-neutral-800">•</span>
                        <span className="text-[9px] font-mono text-neutral-500 uppercase">{(file.size / 1024).toFixed(1)} KB</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={(e) => { e.stopPropagation(); setActiveModal('RENAME'); setTargetPath(file.path); setInputValue(file.name); }} className="p-2.5 text-neutral-500 hover:text-indigo-400 active:scale-90 transition-transform">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); setActiveModal('DELETE'); setTargetPath(file.path); }} className="p-2.5 text-neutral-500 hover:text-rose-500 active:scale-90 transition-transform">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
