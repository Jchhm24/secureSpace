export interface UserInterface {
  id: string;
  name: string;
  lastName: string;
  email: string;
  photoUrl?: string;
  role: 'admin' | 'user';
}
