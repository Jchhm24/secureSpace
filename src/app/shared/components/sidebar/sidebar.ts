import { NgClass, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LogOut, LucideAngularModule, MapPin, UserRound, Warehouse } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  imports: [NgOptimizedImage, RouterLink, LucideAngularModule, NgClass],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  router = inject(Router);
  route = inject(ActivatedRoute);
  currentRoute = computed(() => this.route.snapshot.url[0].path);

  logOutIcon = LogOut;

  paths = [
    {
      route: 'warehouses',
      label: 'Bodegas',
      icon: Warehouse,
    },
    {
      route: 'locations',
      label: 'Ubicaciones',
      icon: MapPin,
    },
    {
      route: 'people',
      label: 'Personas',
      icon: UserRound,
    },
  ];


  logout(){
    localStorage.setItem('isAuthenticated', 'false');
    this.router.navigate(['/login']);
  }

}
