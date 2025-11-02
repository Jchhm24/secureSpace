export interface PeopleData {
  data: Array<{
    actualizadoPor: string;
    apellido: string;
    bloqueado: boolean;
    creadoPor: string;
    email: string;
    fechaCreacion: string;
    fotoPerfil: string;
    id: string;
    nombre: string;
    rol: string;
    telefono: string;
    tokenFCM: string;
    ultimaSesion: string;
  }>;
}
