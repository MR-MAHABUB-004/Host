
export enum ServerStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  STARTING = 'STARTING',
  SUSPENDED = 'SUSPENDED'
}

export interface ServerResource {
  cpu: number; // in cores
  ram: number; // in MB
  disk: number; // in GB
}

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified: string;
  content?: string;
}

export interface BotServer {
  id: string;
  name: string;
  owner: string;
  status: ServerStatus;
  limits: ServerResource;
  usage: ServerResource;
  startupCommand: string;
  mainFile: string;
  port: number;
  liveUrl: string;
  files: FileEntry[]; // Added for persistence
}

export type ViewType = 'DASHBOARD' | 'CONSOLE' | 'SHELL' | 'FILE_MANAGER' | 'SETTINGS' | 'ADMIN';
