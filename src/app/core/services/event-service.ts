import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environment/environment';
import { HistoryInterface } from '@features/my-warehouses/history/interface/history-interface';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;
  private user = inject(UserService);

  private state = signal({
    warehouseHistory: new Map<string, HistoryInterface>(),
  });

  warehouseHistory = computed(() =>
    Array.from(this.state().warehouseHistory.values()),
  );

  constructor() {}

  getWarehouseHistory(id: string) {
    const token = this.user.getToken();

    if (!id) return;

    this.http
      .get(`${this.apiUrl}/eventos/${id}/${this.user.getUserId()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe((response: any) => {
        const data = response.data;

        const newData = new Map<string, HistoryInterface>();

        data.forEach((event: any) => {
          newData.set(event.id, this.adaptWarehouseHistory(event));
        });

        this.state.set({ warehouseHistory: newData });
      });
  }

  private adaptWarehouseHistory(data: any): HistoryInterface {
    return {
      id: data.id,
      warehouseId: data.bodegaId,
      message: data.mensaje,
      level: data.nivel,
      timestamps: data.timestamps,
      type: data.tipo,
      userId: data.usuarioId,
    };
  }
}
