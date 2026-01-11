
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

export interface User {
  username: string;
  passwordHash: string; // Storing as "passwordHash" for terminology, though it will be plain text in this mock
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
  files: FileEntry[];
}

export type ViewType = 'DASHBOARD' | 'CONSOLE' | 'SHELL' | 'FILE_MANAGER' | 'SETTINGS' | 'ADMIN';
