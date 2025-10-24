import { Component, inject, OnInit } from '@angular/core';
import { PeopleTable } from './components/people-table/people-table';
import { LayoutService } from '@core/services/layout-service';

@Component({
  selector: 'app-people',
  imports: [PeopleTable],
  templateUrl: './people.html',
  styleUrl: './people.css'
})
export class People implements OnInit {
  layoutService = inject(LayoutService);

  ngOnInit(): void {
    this.layoutService.setConfig({
      title: 'Personas',
      button: {
        label: 'Agregar Persona',
        ariaLabel: 'Agregar Persona',
        functionAction: () => {
          alert('Agregar Persona button clicked');
        }
      }
    });
  }
}
