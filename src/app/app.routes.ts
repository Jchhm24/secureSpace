import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth-guard';
import { loginGuard } from '@core/guards/login-guard';
import { MainLayout } from '@layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Login - SecureSpace',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
    canActivate: [loginGuard],
  },
  {
    path: 'warehouses',
    title: 'Bodegas - SecureSpace',
    component: MainLayout,
    children: [
      {
        path: '',
        title: 'Lista de Bodegas',
        loadComponent: () => import('./features/warehouses/warehouses').then((m) => m.Warehouses),
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: 'locations',
    title: 'Ubicaciones - SecureSpace',
    component: MainLayout,
    children: [
      {
        path: '',
        title: 'Lista de Ubicaciones',
        loadComponent: () => import('./features/locations/locations').then((m) => m.Locations),
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: 'people',
    title: 'Personas - SecureSpace',
    component: MainLayout,
    children: [
      {
        path: '',
        title: 'Lista de Personas',
        loadComponent: () => import('./features/people/people').then((m) => m.People),
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
