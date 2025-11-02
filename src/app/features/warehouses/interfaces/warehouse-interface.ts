export interface Warehouse {
  id:string;
  name:string;
  location:string;
  register: string;
  owner: string | null;
  status: boolean
  idOwner?: string | null;
}
