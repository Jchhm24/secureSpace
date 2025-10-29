import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withIncrementalHydration(), withEventReplay()),
    provideHttpClient(withFetch()),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'space-127d3',
        appId: '1:50879437493:web:af5f2e4eb677fb83adbcfc',
        databaseURL: 'https://space-127d3-default-rtdb.firebaseio.com',
        storageBucket: 'space-127d3.firebasestorage.app',
        apiKey: 'AIzaSyBYaVdIccNxxTcrtI8NdKF9Z6Tong-3aCU',
        authDomain: 'space-127d3.firebaseapp.com',
        messagingSenderId: '50879437493',
        measurementId: 'G-PMWPKLYN1W',
      }),
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
