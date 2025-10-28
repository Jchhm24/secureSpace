import {
  Component,
  computed,
  effect,
  inject,
  model,
  Signal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '@core/services/layout-service';
import { Sidebar } from '@shared/components/sidebar/sidebar';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LucideAngularModule } from 'lucide-angular';
import { IconService } from '@core/services/icon-service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  imports: [
    Sidebar,
    RouterOutlet,
    ButtonComponent,
    LucideAngularModule,
    NgClass,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  private layoutService = inject(LayoutService);

  username = signal('Julio Cesar Chan Manrique');

  // Get the values from the LayoutService
  title = this.layoutService.title;
  showAction = this.layoutService.showAction;
  button = this.layoutService.button;

  icons = inject(IconService).icons;

  private breakpointObserver = inject(BreakpointObserver);

  // * different screen sizes only affect the html, not the ts logic
  protected isDesktop: Signal<boolean> = toSignal(
    this.breakpointObserver
      .observe('(width > 1200px)')
      .pipe(map((result) => result.matches)),
    { initialValue: true },
  );

  protected isTablet: Signal<boolean> = toSignal(
    this.breakpointObserver
      .observe('(width > 730px && width <= 1200px)')
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  protected isMobile = computed(() => {
    return !this.isDesktop() && !this.isTablet();
  });

  // * logic to another components
  // to sidebar component
  isExpanded = model(this.isDesktop());

  // * breakpoints that affect the layout with ts logic
  private breakpointLogic = effect(() => {
    if (this.isDesktop()) {
      this.isExpanded.set(true);
    } else {
      this.isExpanded.set(false);
    }

    if (this.isMobile()) {
      this.isExpanded.set(false);
    }
  });
}
