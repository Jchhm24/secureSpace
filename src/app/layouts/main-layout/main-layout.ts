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
import { UserService } from '@core/services/user-service';
import { ToastContainer } from '@shared/components/toast-container/toast-container';

@Component({
  selector: 'app-main-layout',
  imports: [
    Sidebar,
    RouterOutlet,
    ButtonComponent,
    LucideAngularModule,
    NgClass,
    ToastContainer,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  // layout service
  private layoutService = inject(LayoutService);
  protected title = this.layoutService.title;
  protected showAction = this.layoutService.showAction;
  protected button = this.layoutService.button;

  // user service
  protected user = inject(UserService).user();

  onActionClick() {
    this.layoutService.notifyButtonClick();
  }

  icons = inject(IconService).icons;

  private breakpointObserver = inject(BreakpointObserver);

  // * different screen sizes only affect the html, not the ts logic
  protected isDesktop: Signal<boolean> = toSignal(
    this.breakpointObserver
      .observe('(min-width: 1200px)')
      .pipe(map((result) => result.matches)),
    { initialValue: true },
  );

  protected isTablet: Signal<boolean> = toSignal(
    this.breakpointObserver
      .observe('(min-width: 730px) and (max-width: 1199px)')
      // width >= 730px and width <= 1199px
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
    if (this.isMobile()) {
      this.isExpanded.set(false);
    } else if (this.isTablet()) {
      this.isExpanded.set(false);
    } else if (this.isDesktop()) {
      this.isExpanded.set(true);
    }
  });
}
