import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, merge, Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface PendingOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN';
  endpoint: string;
  method: string;
  body: any;
  timestamp: number;
  retryCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  private platformId = inject(PLATFORM_ID);
  private _isOnline = signal<boolean>(this.isBrowser() ? navigator.onLine : true);
  private _pendingOperations = signal<PendingOperation[]>([]);
  private _lastSyncTime = signal<number | null>(null);

  readonly isOnline = this._isOnline.asReadonly();
  readonly pendingOperations = this._pendingOperations.asReadonly();
  readonly lastSyncTime = this._lastSyncTime.asReadonly();

  public online$: Observable<boolean>;

  constructor() {
    // Create observable for online/offline status
    if (this.isBrowser()) {
      this.online$ = merge(
        of(navigator.onLine),
        fromEvent(window, 'online').pipe(map(() => true)),
        fromEvent(window, 'offline').pipe(map(() => false)),
      ).pipe(startWith(navigator.onLine));

      // Subscribe to online/offline events
      this.online$.subscribe((isOnline) => {
        this._isOnline.set(isOnline);
        if (isOnline) {
          this.onConnectionRestored();
        }
      });
    } else {
      // Server-side: always assume online
      this.online$ = of(true);
    }

    // Load pending operations from localStorage
    this.loadPendingOperations();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Check if currently online
   */
  checkOnlineStatus(): boolean {
    return this._isOnline();
  }

  /**
   * Add a pending operation to the queue
   */
  addPendingOperation(
    operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>,
  ): void {
    const newOperation: PendingOperation = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    const currentOps = this._pendingOperations();
    this._pendingOperations.set([...currentOps, newOperation]);
    this.savePendingOperations();
  }

  /**
   * Remove a pending operation from the queue
   */
  removePendingOperation(operationId: string): void {
    const updatedOps = this._pendingOperations().filter(
      (op) => op.id !== operationId,
    );
    this._pendingOperations.set(updatedOps);
    this.savePendingOperations();
  }

  /**
   * Get all pending operations
   */
  getPendingOperations(): PendingOperation[] {
    return this._pendingOperations();
  }

  /**
   * Clear all pending operations
   */
  clearPendingOperations(): void {
    this._pendingOperations.set([]);
    if (this.isBrowser()) {
      localStorage.removeItem('pendingOperations');
    }
  }

  /**
   * Increment retry count for an operation
   */
  incrementRetryCount(operationId: string): void {
    const ops = this._pendingOperations().map((op) =>
      op.id === operationId ? { ...op, retryCount: op.retryCount + 1 } : op,
    );
    this._pendingOperations.set(ops);
    this.savePendingOperations();
  }

  /**
   * Update last sync time
   */
  updateLastSyncTime(): void {
    const now = Date.now();
    this._lastSyncTime.set(now);
    if (this.isBrowser()) {
      localStorage.setItem('lastSyncTime', now.toString());
    }
  }

  /**
   * Get last sync time formatted
   */
  getLastSyncTimeFormatted(): string | null {
    const lastSync = this._lastSyncTime();
    if (!lastSync) return null;

    const now = Date.now();
    const diff = now - lastSync;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Justo ahora';
    if (minutes < 60) return `${minutes} minuto${minutes > 1 ? 's' : ''} hace`;
    if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''} hace`;
    return `${days} día${days > 1 ? 's' : ''} hace`;
  }

  /**
   * Called when connection is restored
   */
  private onConnectionRestored(): void {
    // console.log(
    //   'Conexión restaurada. Operaciones pendientes:',
    //   this._pendingOperations().length,
    // );
    // The sync logic will be handled by the HTTP interceptor or a dedicated sync service
  }

  /**
   * Save pending operations to localStorage
   */
  private savePendingOperations(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.setItem(
        'pendingOperations',
        JSON.stringify(this._pendingOperations()),
      );
    } catch (error) {
      console.error('Error al guardar operaciones pendientes:', error);
    }
  }

  /**
   * Load pending operations from localStorage
   */
  private loadPendingOperations(): void {
    if (!this.isBrowser()) return;

    try {
      const stored = localStorage.getItem('pendingOperations');
      if (stored) {
        const operations = JSON.parse(stored) as PendingOperation[];
        this._pendingOperations.set(operations);
      }

      const lastSync = localStorage.getItem('lastSyncTime');
      if (lastSync) {
        this._lastSyncTime.set(parseInt(lastSync, 10));
      }
    } catch (error) {
      console.error('Error al cargar operaciones pendientes:', error);
    }
  }

  /**
   * Generate unique operation ID
   */
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
