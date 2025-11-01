export interface Warehouse {
  id:string;
  name:string;
  location:string;
  register: Date;
  owner: string | null;
  status: boolean
}
