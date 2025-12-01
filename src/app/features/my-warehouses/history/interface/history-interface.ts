export interface HistoryInterface {
  id: string;
  warehouseId: string;
  message: string;
  level: string;
  timestamps: string;
  type: 'Asignación' | 'Desasignación' | 'Abierto' | 'Cerrado';
  userId: string;
}
