export interface SyncOperation {
  id: string;
  operation: 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  payload: any;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  retryCount: number;
  lastError?: string;
  createdAt: number;
}

const DB_NAME = 'SipekaOfflineDB';
const STORE_NAME = 'sync_queue';

export class OfflineSyncService {
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async addToQueue(operation: Omit<SyncOperation, 'id' | 'status' | 'retryCount' | 'createdAt'>) {
    if (!this.db) await this.init();
    
    const item: SyncOperation = {
      ...operation,
      id: crypto.randomUUID(),
      status: 'PENDING',
      retryCount: 0,
      createdAt: Date.now(),
    };

    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getQueue(): Promise<SyncOperation[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async processQueue() {
    const queue = await this.getQueue();
    const pending = queue.filter(q => q.status === 'PENDING' || q.status === 'FAILED');
    
    for (const item of pending) {
      if (item.retryCount > 5) continue; // max retries

      try {
        await fetch(item.endpoint, {
          method: item.operation,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });
        
        await this.removeFromQueue(item.id);
      } catch (err: any) {
        await this.updateQueueItem(item.id, {
          status: 'FAILED',
          retryCount: item.retryCount + 1,
          lastError: err.message
        });
      }
    }
  }

  private async removeFromQueue(id: string) {
    if (!this.db) await this.init();
    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  private async updateQueueItem(id: string, updates: Partial<SyncOperation>) {
    if (!this.db) await this.init();
    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const item = req.result;
        if (item) {
          const updated = { ...item, ...updates };
          const putReq = store.put(updated);
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => reject(putReq.error);
        } else {
          resolve();
        }
      };
      req.onerror = () => reject(req.error);
    });
  }
}

export const offlineSync = new OfflineSyncService();
