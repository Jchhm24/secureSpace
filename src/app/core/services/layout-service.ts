import { computed, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface LayoutConfig {
  title: string;
  showAction: boolean;
  button: {
    label: string,
    ariaLabel: string,
  };
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private config = signal<LayoutConfig>({
    title: 'title of the page',
    showAction: true,
    button: {
      label: 'Default Button',
      ariaLabel: 'Default Button',
    }
  })

  readonly title = computed(() => this.config().title);
  readonly showAction = computed(() => this.config().showAction)
  readonly button = {
    label: computed(() => this.config().button.label),
    ariaLabel: computed(() => this.config().button.ariaLabel),
  };

  private buttonClick = new Subject<void>();
  readonly onButtonClick$ = this.buttonClick.asObservable();

  setConfig(config: Partial<LayoutConfig>) {
    this.config.update(current => ({ ...current, ...config }));
  }

  notifyButtonClick() {
    this.buttonClick.next();
  }
}
