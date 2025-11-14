import { NgClass } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ConfirmActionModalService } from '@core/services/confirm-action-modal-service';
import { PeopleService } from '@core/services/people-service';
import { ToastService } from '@core/services/toast-service';
import { People } from '@features/people/interfaces/people-interface';
import { ButtonIcon } from '@shared/components/button-icon/button-icon';
import { InputComponent } from '@shared/components/input-component/input-component';
import { paginateTable } from '@shared/utils/helpers/paginateTable';
import { Subscription } from 'rxjs';
import { ButtonActionsCompact } from '@shared/components/button-actions-compact/button-actions-compact';
import { ButtonActionCompact } from '@shared/interfaces/button-action-compact-interface';

@Component({
  selector: 'app-people-table',
  imports: [InputComponent, ButtonIcon, NgClass, ButtonActionsCompact],
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
  private actionModalService = inject(ConfirmActionModalService);
  private clickSubModal?: Subscription;

  protected buttonsActions: ButtonActionCompact[] = [
    {
      label: 'Bloquear/Desbloquear',
      action: (personId?: string) => {
        if (personId) this.lockUnlockPerson(personId);
      },
    },
    {
      label: 'Eliminar',
      action: (personId?: string) => {
        if (personId) this.openDeletePersonModal(personId);
      },
    },
  ];

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
          this.actionModalService.closeModal();
        } else {
          this.toast.show(response.message, 'error');
        }
      });
  }

  openDeletePersonModal(personId: string): void {
    const person = this.peoples().find((p) => p.id === personId);
    if (!person) return;

    this.actionModalService.setConfig({
      title: '¿Estás seguro de eliminar a esta persona?',
      message: `Esta acción no se puede deshacer. Persona: ${person.name} ${person.lastName}`,
      buttonText: 'Eliminar',
    });

    this.clickSubModal = this.actionModalService.onButtonClick$.subscribe(
      () => {
        this.deletePerson(personId);
        this.clickSubModal?.unsubscribe();
      },
    );

    this.actionModalService.openModal();
  }
}
