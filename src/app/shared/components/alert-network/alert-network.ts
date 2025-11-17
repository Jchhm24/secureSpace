import { Component, inject } from '@angular/core';
import { OfflineService } from '@core/services/offline-service';
import { SyncService } from '@core/services/sync-service';
import { CommonModule } from '@angular/common';
import { IconService } from '@core/services/icon-service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-alert-network',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './alert-network.html',
  styleUrl: './alert-network.css',
})
export class AlertNetwork {
  protected readonly offlineService = inject(OfflineService);
  protected readonly syncService = inject(SyncService);
  protected isOnline = this.offlineService.isOnline;
  protected lastSync = this.offlineService.lastSyncTime;
  protected pendingOps = this.offlineService.pendingOperations;
  protected icons = inject(IconService).icons;

  getLastSyncFormatted(): string {
    return this.offlineService.getLastSyncTimeFormatted() || 'Never';
  }

  manualSync(): void {
    this.syncService.manualSync();
  }
}
