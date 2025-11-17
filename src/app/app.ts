import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SyncService } from '@core/services/sync-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('SecureSpace');

  // Initialize SyncService to start listening for online/offline events
  private syncService = inject(SyncService);
}
