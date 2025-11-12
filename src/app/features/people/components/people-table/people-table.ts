import { NgClass } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PeopleService } from '@core/services/people-service';
import { ToastService } from '@core/services/toast-service';
import { People } from '@features/people/interfaces/people-interface';
import { ButtonIcon } from '@shared/components/button-icon/button-icon';
import { InputComponent } from '@shared/components/input-component/input-component';
import { paginateTable } from '@shared/utils/helpers/paginateTable';

@Component({
  selector: 'app-people-table',
  imports: [InputComponent, ButtonIcon, NgClass],
  templateUrl: './people-table.html',
  styleUrl: './people-table.css',
})
export class PeopleTable {
  protected ITEMS_PER_PAGE = 5;

  protected searchControl = new FormControl('');
  private peopleService = inject(PeopleService);
  private toast = inject(ToastService);
  protected peoples = signal<People[]>([]);
  protected groupedPeoples = signal<People[][]>([]);
  protected index_page = signal(0);

  private peopleData = effect(() => {
    const peoples = this.peopleService.people();
    this.getPaginatedData(this.ITEMS_PER_PAGE, peoples);
  });

  getPaginatedData(limit: number, data: People[] | undefined): void {
    const tableIndications = paginateTable(limit, data);
    this.groupedPeoples.set(tableIndications.groupedData);
    this.peoples.set(tableIndications.paginatedData);
  }

  changePage(page: number): void {
    this.index_page.set(page);
    this.peoples.set(this.groupedPeoples()[page] || []);
  }

  deletePerson(personId: string): void {
    this.peopleService
      .deletePerson(personId)
      .subscribe((response: { success: boolean; message: string }) => {
        if (response.success) {
          this.peopleService.getPeople();
          this.toast.show(response.message, 'success');
        } else {
          this.toast.show(response.message, 'error');
        }
      });
  }

  lockUnlockPerson(personId: string): void {
    this.peopleService
      .lockUnlockPerson(personId)
      .subscribe((response: { success: boolean; message: string }) => {
        if (response.success) {
          this.peopleService.getPeople();
          this.toast.show(response.message, 'success');
        } else {
          this.toast.show(response.message, 'error');
        }
      });
  }
}
