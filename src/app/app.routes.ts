import { Routes } from '@angular/router';
import { MainLayout } from '@layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Login - SecureSpace',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
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
    ]
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
