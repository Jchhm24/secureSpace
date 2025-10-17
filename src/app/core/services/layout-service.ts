import { computed, Injectable, signal } from '@angular/core';

export interface LayoutConfig {
  title: string;
  showAction: boolean;
  button: {
    label: string,
    ariaLabel: string,
    functionAction: () => void;
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
      functionAction: () => { console.log('this function was called, replace with new implementation') }
    }
  })

  readonly title = computed(() => this.config().title);
  readonly showAction = computed(() => this.config().showAction)
  readonly button = {
    label: computed(() => this.config().button.label),
    ariaLabel: computed(() => this.config().button.ariaLabel),
    functionAction: computed(() => this.config().button.functionAction)
  };

  setConfig(config: Partial<LayoutConfig>) {
    this.config.update(current => ({ ...current, ...config }));
  }
}
