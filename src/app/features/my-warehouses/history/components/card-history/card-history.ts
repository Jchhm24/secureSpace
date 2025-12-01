import { Component, input, computed } from '@angular/core';
import { TypeHistoryBadge } from '../type-history-badge/type-history-badge';

@Component({
  selector: 'app-card-history',
  imports: [TypeHistoryBadge],
  templateUrl: './card-history.html',
  styleUrl: './card-history.css',
})
export class CardHistory {
  type = input.required<
    'Asignación' | 'Desasignación' | 'Abierto' | 'Cerrado'
  >();
  message = input.required<string>();
  timestamps = input.required<string>();

  formattedTime = computed(() => {
    const date = new Date(this.timestamps());
    return date.toLocaleTimeString('es-ES', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  });
}
