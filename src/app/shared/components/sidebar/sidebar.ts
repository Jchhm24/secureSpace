import { NgClass, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input, model } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconService } from '@core/services/icon-service';
import { LucideAngularModule } from 'lucide-angular';
import { LabelIndicator } from './components/label-indicator/label-indicator';

@Component({
  selector: 'app-sidebar',
  imports: [
    NgOptimizedImage,
    RouterLink,
    LucideAngularModule,
    NgClass,
    LabelIndicator,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  router = inject(Router);
  route = inject(ActivatedRoute);
  currentRoute = computed(() => this.route.snapshot.url[0].path);

  icons = inject(IconService).icons;

  paths = [
    {
      route: 'warehouses',
      label: 'Bodegas',
      icon: this.icons.warehouse,
    },
    {
      route: 'locations',
      label: 'Ubicaciones',
      icon: this.icons.mapPin,
    },
    {
      route: 'people',
      label: 'Personas',
      icon: this.icons.userRound,
    },
  ];

  isExpanded = model.required<boolean>();
  isMobile = input.required<boolean>();

  logout() {
    localStorage.setItem('isAuthenticated', 'false');
    this.router.navigate(['/login']);
  }
}
