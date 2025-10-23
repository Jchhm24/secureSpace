import { Injectable } from '@angular/core';
import {
  ChartBar,
  Search,
} from 'lucide-angular';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  readonly icons = {
    chartBar: ChartBar,
    search: Search,
  } as const;

  // TODO: It´s important to use LucideAngularModule in the module imports where this service is going to be used
  //TODO: into the components that will use these icons.
}
