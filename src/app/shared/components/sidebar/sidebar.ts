import { NgClass, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input, model } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconService } from '@core/services/icon-service';
import { LucideAngularModule } from 'lucide-angular';
import { LabelIndicator } from './components/label-indicator/label-indicator';
import { AuthService } from '@core/services/auth-service';
import { UserService } from '@core/services/user-service';

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

  private authService = inject(AuthService);
  protected user = inject(UserService).user();

  protected icons = inject(IconService).icons;

  protected paths = [
    {
      route: 'warehouses',
      label: 'Bodegas',
      icon: this.icons.warehouse,
      rol: ['admin'],
    },
    {
      route: 'locations',
      label: 'Ubicaciones',
      icon: this.icons.mapPin,
      rol: ['admin'],
    },
    {
      route: 'people',
      label: 'Personas',
      icon: this.icons.userRound,
      rol: ['admin'],
    },
    {
      route: 'my-warehouses',
      label: 'Mi Bodega',
      icon: this.icons.warehouse,
      rol: ['user'],
    },
    {
      route: 'notifications',
      label: 'Notificaciones',
      icon: this.icons.bell,
      rol: ['user'],
    },
  ];

  isExpanded = model.required<boolean>();
  isMobile = input.required<boolean>();

  logout() {
    this.authService.signOut().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Sign out error:', error);
      },
    });
  }
}
