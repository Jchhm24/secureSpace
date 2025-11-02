export interface People {
  id:string;
  name:string;
  lastName:string;
  email:string;
  phone:string;
  role: 'admin' | 'user';
  blocked:boolean;
  tokenFCM?:string;
}
