export interface ToastInterface {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // duration in milliseconds
}
