export interface WarehouseHomeData {
  info: {
    total: number;
    libres: number;
    ocupadas: number;
  };
  data: Array<{
    id: string;
    nombre: string;
    ubicacion: string;
    personaAsignada: string;
    estado: string;
    ultimoRegistro: string;
    IdpersonaAsignada: string;
  }>;
}
