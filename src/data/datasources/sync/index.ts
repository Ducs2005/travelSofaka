import { SyncEngine } from './SyncEngine';

/** Singleton dùng chung cho toàn ứng dụng (App khởi động ở App.tsx) */
export const syncEngine = new SyncEngine();

export function startSyncEngine(): () => void {
  return syncEngine.start();
}

export { SyncEngine } from './SyncEngine';
export type { NetworkMonitor, SyncListener } from './SyncEngine';
