import { NgClass } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IconService } from '@core/services/icon-service';
import { LocationsService } from '@core/services/locations-service';
import { Location } from '@features/locations/interfaces/locations-interface';
import { ButtonIcon } from '@shared/components/button-icon/button-icon';
import { InputComponent } from '@shared/components/input-component/input-component';
import { DateFormatPipe } from '@shared/pipes/date-format-pipe';
import { paginateTable } from '@shared/utils/helpers/paginateTable';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-locations-table',
  imports: [
    LucideAngularModule,
    InputComponent,
    ButtonIcon,
    DateFormatPipe,
    NgClass,
  ],
  templateUrl: './locations-table.html',
  styleUrl: './locations-table.css',
})
export class LocationsTable {
  private readonly ITEMS_PER_PAGE = 5;

  protected searchControl = new FormControl('');
  protected locationsService = inject(LocationsService);
  protected locations = signal<Location[]>([]);
  protected groupedLocations = signal<Location[][]>([]);
  protected index_page = signal(0);

  protected icons = inject(IconService).icons;

  private locationsData = effect(() => {
    const locations = this.locationsService.locations();
    this.getPaginatedDate(this.ITEMS_PER_PAGE, locations);
  });

  getPaginatedDate(limit: number, data: Location[] | undefined): void {
    const tableIndications = paginateTable(limit, data);
    this.groupedLocations.set(tableIndications.groupedData);
    this.locations.set(tableIndications.paginatedData);
  }

  changePage(page: number): void {
    this.index_page.set(page);
    this.locations.set(this.groupedLocations()[page] || []);
  }

  functionButton() {
    alert('solo para representar el boton');
  }
}
