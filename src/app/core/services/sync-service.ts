import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { OfflineService, PendingOperation } from './offline-service';
import { ToastService } from './toast-service';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private http = inject(HttpClient);
  private offlineService = inject(OfflineService);
  private toastService = inject(ToastService);
  private platformId = inject(PLATFORM_ID);
  private isSyncing = false;

  constructor() {
    // console.log('🔄 SyncService initialized');
    // Listen for online status changes
    this.offlineService.online$.subscribe((isOnline) => {
      // console.log('📡 Online status changed:', isOnline);
      if (isOnline && !this.isSyncing) {
        const pendingCount = this.offlineService.getPendingOperations().length;
        // console.log(
        //   '🔄 Attempting to sync',
        //   pendingCount,
        //   'pending operations',
        // );
        this.syncPendingOperations();
      }
    });
  }

  /**
   * Sync all pending operations when back online
   */
  async syncPendingOperations(): Promise<void> {
    const pendingOps = this.offlineService.getPendingOperations();

    // console.log('📋 Pending operations to sync:', pendingOps);

    if (pendingOps.length === 0) {
      // console.log('✅ No pending operations to sync');
      return;
    }

    this.isSyncing = true;
    this.toastService.show(
      `Syncing ${pendingOps.length} pending operation(s)...`,
      'info',
    );

    let successCount = 0;
    let failCount = 0;

    for (const operation of pendingOps) {
      // console.log('🔄 Executing operation:', operation);
      try {
        const success = await this.executeOperation(operation);
        if (success) {
          // console.log('✅ Operation succeeded:', operation.id);
          this.offlineService.removePendingOperation(operation.id);
          successCount++;
        } else {
          // console.log('❌ Operation failed:', operation.id);
          this.offlineService.incrementRetryCount(operation.id);
          failCount++;

          // Remove operation if it has failed too many times
          if (operation.retryCount >= 3) {
            this.offlineService.removePendingOperation(operation.id);
            console.error(
              `Operation ${operation.id} failed after 3 retries, removing from queue`,
            );
          }
        }
      } catch (error) {
        console.error('Error executing operation:', error);
        this.offlineService.incrementRetryCount(operation.id);
        failCount++;
      }

      // Small delay between operations to avoid overwhelming the server
      await this.delay(300);
    }

    this.isSyncing = false;

    // Show result toast
    if (successCount > 0 && failCount === 0) {
      this.toastService.show(
        `Successfully synced ${successCount} operation(s)!`,
        'success',
      );
    } else if (successCount > 0 && failCount > 0) {
      this.toastService.show(
        `Synced ${successCount} operation(s), ${failCount} failed`,
        'warning',
      );
    } else if (failCount > 0) {
      this.toastService.show(
        `Failed to sync ${failCount} operation(s)`,
        'error',
      );
    }

    // Refresh data after sync
    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    }
  }

  /**
   * Execute a pending operation
   */
  private async executeOperation(
    operation: PendingOperation,
  ): Promise<boolean> {
    // console.log(
    //   '🚀 Executing HTTP request:',
    //   operation.method,
    //   operation.endpoint,
    // );
    return new Promise((resolve) => {
      let request;

      switch (operation.method) {
        case 'POST':
          request = this.http.post(operation.endpoint, operation.body);
          break;
        case 'PUT':
          request = this.http.put(operation.endpoint, operation.body);
          break;
        case 'DELETE':
          request = this.http.delete(operation.endpoint);
          break;
        default:
          console.error('Unknown HTTP method:', operation.method);
          resolve(false);
          return;
      }

      request
        .pipe(
          tap((response) => {
            // console.log(
            //   `✅ Successfully executed ${operation.method} ${operation.endpoint}`,
            //   response,
            // );
          }),
          catchError((error) => {
            // console.error(
            //   `❌ Failed to execute ${operation.method} ${operation.endpoint}:`,
            //   error,
            // );
            return of(null);
          }),
        )
        .subscribe((response) => {
          resolve(response !== null);
        });
    });
  }

  /**
   * Manual sync trigger
   */
  manualSync(): void {
    if (!this.offlineService.checkOnlineStatus()) {
      this.toastService.show('Cannot sync while offline', 'warning');
      return;
    }

    if (this.isSyncing) {
      this.toastService.show('Sync already in progress...', 'info');
      return;
    }

    this.syncPendingOperations();
  }

  /**
   * Helper delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
