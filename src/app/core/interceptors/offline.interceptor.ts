import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { OfflineService } from '../services/offline-service';
import { ToastService } from '../services/toast-service';

export const offlineInterceptor: HttpInterceptorFn = (req, next) => {
  const offlineService = inject(OfflineService);
  const toastService = inject(ToastService);

  // Check if offline
  if (!offlineService.checkOnlineStatus()) {
    // Only allow GET requests when offline (cached data)
    if (req.method === 'GET') {
      // Let the service worker handle it from cache
      return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 0 || !navigator.onLine) {
            toastService.show('Tu estas en modo offline. Mostrando datos en caché.', 'warning');
          }
          return throwError(() => error);
        }),
      );
    }

    // For write operations (POST, PUT, DELETE), queue them
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      // Queue the operation for later
      offlineService.addPendingOperation({
        type: getOperationType(req.method, req.url),
        endpoint: req.url,
        method: req.method,
        body: req.body,
      });

      toastService.show('Operación en cola. Se sincronizará cuando esté en línea.');

      // Return error to prevent the operation from proceeding
      return throwError(
        () =>
          new HttpErrorResponse({
            error: 'Offline - Operation queued',
            status: 0,
            statusText: 'Offline',
            url: req.url,
          }),
      );
    }
  }

  // When online, proceed normally
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle network errors
      if (error.status === 0 && !navigator.onLine) {
        // Network error while offline
        if (req.method !== 'GET') {
          offlineService.addPendingOperation({
            type: getOperationType(req.method, req.url),
            endpoint: req.url,
            method: req.method,
            body: req.body,
          });

          toastService.show(
            '. Operación en cola. Se reintentará cuando esté en línea.',
            'error',
          );
        } else {
          toastService.show(
            'No se pueden obtener datos frescos. Usando la versión en caché.',
            'warning',
          );
        }
      }

      return throwError(() => error);
    }),
  );
};

/**
 * Determine operation type from request method and URL
 */
function getOperationType(
  method: string,
  url: string,
): 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' {
  if (method === 'POST') {
    if (url.includes('/asignar/')) return 'ASSIGN';
    return 'CREATE';
  }
  if (method === 'PUT') {
    if (url.includes('/asignar/')) return 'ASSIGN';
    return 'UPDATE';
  }
  if (method === 'DELETE') return 'DELETE';
  return 'UPDATE';
}
