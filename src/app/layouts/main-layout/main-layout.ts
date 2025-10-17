import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '@core/services/layout-service';
import { Sidebar } from '@shared/components/sidebar/sidebar';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LucideAngularModule, Plus } from 'lucide-angular';


@Component({
  selector: 'app-main-layout',
  imports: [Sidebar, RouterOutlet, ButtonComponent, LucideAngularModule],
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

  // Icons
  plusIcon = Plus;
}
