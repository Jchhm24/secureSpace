import { Injectable } from '@angular/core';
import { ToastInterface } from '@shared/interfaces/toast-interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = new BehaviorSubject<ToastInterface[]>([]);
  public toasts$ = this.toasts.asObservable();

  private currentId = 0;

  show(message: string, type:ToastInterface['type']= 'info', duration = 5000): void {
    this.currentId++;
    const id = this.currentId;

    const newToast: ToastInterface = { id, message, type };

    this.toasts.next([...this.toasts.getValue(), newToast]);

    if(duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  remove(id: number):void {
    const currentToasts = this.toasts.getValue();
    const updatedToasts = currentToasts.filter(toast => toast.id !== id);
    this.toasts.next(updatedToasts);
  }

}
