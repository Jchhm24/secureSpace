export interface Warehouse {
  id:number;
  name:string;
  location:string;
  register: string;
  owner: string | null;
  status: boolean
}
