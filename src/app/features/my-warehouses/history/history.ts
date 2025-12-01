import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '@core/services/event-service';
import { IconService } from '@core/services/icon-service';
import { LayoutService } from '@core/services/layout-service';
import { LucideAngularModule } from 'lucide-angular';
import { CardHistory } from './components/card-history/card-history';

@Component({
  selector: 'app-history',
  imports: [RouterLink, LucideAngularModule, CardHistory],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History implements OnInit {
  private route = inject(ActivatedRoute);
  private layoutService = inject(LayoutService);
  private eventService = inject(EventService);
  protected warehouseHistory = this.eventService.warehouseHistory;

  protected groupedHistory = computed(() => {
    const history = this.warehouseHistory();
    const groups = new Map<
      string,
      { day: string; month: string; events: any[] }
    >();

    // Sort by date descending
    const sortedHistory = [...history].sort((a, b) => {
      return (
        new Date(b.timestamps).getTime() - new Date(a.timestamps).getTime()
      );
    });

    sortedHistory.forEach((event) => {
      const date = new Date(event.timestamps);
      const key = date.toDateString(); // Group by unique day

      if (!groups.has(key)) {
        const day = date.getDate().toString();
        const month = date.toLocaleString('es-ES', { month: 'short' });
        // Capitalize first letter of month
        const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1);

        groups.set(key, {
          day,
          month: formattedMonth,
          events: [],
        });
      }

      groups.get(key)!.events.push(event);
    });

    return Array.from(groups.values());
  });

  protected icons = inject(IconService).icons;
  protected warehouseId = signal<string>('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.warehouseId.set(id || '');

    this.layoutService.setConfig({
      title: 'Historial',
      showAction: false,
    });

    this.eventService.getWarehouseHistory(this.warehouseId());
  }
}
