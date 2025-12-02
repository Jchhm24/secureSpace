import { Injectable } from '@angular/core';
import {
  Bell,
  ChartBar,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleUserRound,
  CircleX,
  EllipsisVertical,
  History,
  Lock,
  LockOpen,
  LogOut,
  MapPin,
  Plus,
  QrCode,
  Search,
  SquarePen,
  Trash2,
  TriangleAlert,
  UserMinus,
  UserRound,
  UserRoundPlus,
  Warehouse,
  X,
  UserStar,
  Unlink,
  LoaderCircle,
} from 'lucide-angular';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  readonly icons = {
    chartBar: ChartBar,
    search: Search,
    personAdd: UserRoundPlus,
    history: History,
    qrCode: QrCode,
    edit: SquarePen,
    trash: Trash2,
    warehouse: Warehouse,
    mapPin: MapPin,
    userRound: UserRound,
    logOut: LogOut,
    lockOpen: LockOpen,
    lock: Lock,
    plus: Plus,
    circleCheck: CircleCheck,
    circleAlert: CircleAlert,
    chevronRight: ChevronRight,
    x: X,
    chevronDown: ChevronDown,
    circleUserRound: CircleUserRound,
    circleX: CircleX,
    triangleAlert: TriangleAlert,
    ellipsisVertical: EllipsisVertical,
    userMinus: UserMinus,
    bell: Bell,
    userStar: UserStar,
    unlink: Unlink,
    loaderCircle: LoaderCircle
  } as const;

  // TODO: It´s important to use LucideAngularModule in the module imports where this service is going to be used
  //TODO: into the components that will use these icons.
}
