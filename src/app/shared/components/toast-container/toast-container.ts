import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IconService } from '@core/services/icon-service';
import { ToastService } from '@core/services/toast-service';
import { ToastInterface } from '@shared/interfaces/toast-interface';
import { Observable } from 'rxjs';
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: 'app-toast-container',
  imports: [AsyncPipe, LucideAngularModule, NgClass, LucideAngularModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css'
})
export class ToastContainer {

  protected icons = inject(IconService).icons;

  toasts$: Observable<ToastInterface[]>;

  constructor(private toastService: ToastService){
    this.toasts$ = this.toastService.toasts$;
  }

  closeToast(id: number): void {
    this.toastService.remove(id);
  }

  trackById(index: number, toast: ToastInterface): number {
    return toast.id;
  }

}

