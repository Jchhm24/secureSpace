export interface Warehouse {
  id:number;
  name:string;
  location:string;
  register: Date;
  owner: string | null;
  status: boolean
}
