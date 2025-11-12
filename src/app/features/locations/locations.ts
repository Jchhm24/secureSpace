import { Component, inject, OnInit } from '@angular/core';
import { LayoutService } from '@core/services/layout-service';
import { LocationsTable } from './components/locations-table/locations-table';
import { useToggle } from '@shared/hooks/use-toggle';
import { Subscription } from 'rxjs';
import { CreateLocationModal } from './components/create-location-modal/create-location-modal';

@Component({
  selector: 'app-locations',
  imports: [LocationsTable, CreateLocationModal],
  templateUrl: './locations.html',
  styleUrl: './locations.css',
})
export class Locations implements OnInit {
  private layoutService = inject(LayoutService);
  protected modal = useToggle();
  private clickSub?: Subscription;

  ngOnInit(): void {
    this.layoutService.setConfig({
      title: 'Ubicaciones',
      showAction: true,
      button: {
        label: 'Agregar ubicación',
        ariaLabel: 'Agregar ubicación',
      },
    });

    this.clickSub = this.layoutService.onButtonClick$.subscribe(() => {
      this.modal.open();
    });
  }

  ngOnDestroy(): void {
    this.clickSub?.unsubscribe();
  }
}
