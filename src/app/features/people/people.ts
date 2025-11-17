import { Component, inject, OnInit } from '@angular/core';
import { PeopleTable } from './components/people-table/people-table';
import { LayoutService } from '@core/services/layout-service';
import { CreatePeopleModal } from './components/create-people-modal/create-people-modal';
import { useToggle } from '@shared/hooks/use-toggle';
import { Subscription } from 'rxjs';
import { AlertNetwork } from '@shared/components/alert-network/alert-network';

@Component({
  selector: 'app-people',
  imports: [PeopleTable, CreatePeopleModal, AlertNetwork],
  templateUrl: './people.html',
  styleUrl: './people.css',
})
export class People implements OnInit {
  private layoutService = inject(LayoutService);
  protected modal = useToggle();
  private clickSub?: Subscription;

  ngOnInit(): void {
    this.layoutService.setConfig({
      title: 'Personas',
      button: {
        label: 'Agregar Persona',
        ariaLabel: 'Agregar Persona',
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
