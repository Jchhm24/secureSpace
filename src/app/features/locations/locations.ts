import { Component, inject, OnInit } from '@angular/core';
import { LayoutService } from '@core/services/layout-service';
import { LocationsTable } from './components/locations-table/locations-table';

@Component({
  selector: 'app-locations',
  imports: [LocationsTable],
  templateUrl: './locations.html',
  styleUrl: './locations.css'
})
export class Locations implements OnInit {
  private layoutService = inject(LayoutService)

  ngOnInit(): void {
    this.layoutService.setConfig({
      title: 'Ubicaciones',
      showAction: true,
      button: {
        label: 'Agregar ubicación',
        ariaLabel: 'Agregar ubicación',
      },
    })
  }
}
