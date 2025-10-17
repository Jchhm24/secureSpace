import { Component, inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LayoutService } from '@core/services/layout-service';
import { ButtonIcon } from '@shared/components/button-icon/button-icon';
import { InputComponent } from '@shared/components/input-component/input-component';
import { WarehouseCard } from '@shared/components/warehouse-card/warehouse-card';
import { LucideAngularModule, ChartBar, Search } from 'lucide-angular';
import { BadgeEnable } from './components/badge-enable/badge-enable';

@Component({
  selector: 'app-warehouses',
  imports: [
    WarehouseCard,
    InputComponent,
    ButtonIcon,
    LucideAngularModule,
    BadgeEnable,
  ],
  templateUrl: './warehouses.html',
  styleUrl: './warehouses.css',
})
export class Warehouses implements OnInit {
  private layoutService = inject(LayoutService);

  searchControl = new FormControl<string>('');

  ngOnInit(): void {
    this.layoutService.setConfig({
      title: 'Bodegas',
      showAction: true,
      button: {
        label: 'Crear Bodega',
        ariaLabel: 'Crear Bodega',
        functionAction: () => {
          alert('Boton para crear bodega');
        },
      },
    });
  }

  icons = {
    chartBar: ChartBar,
    search: Search,
  };

  functionButton() {
    alert('solo para representar el boton');
  }
}
