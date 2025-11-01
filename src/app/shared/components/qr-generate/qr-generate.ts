import { Component, input, model } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { ButtonIcon } from '../button-icon/button-icon';

@Component({
  selector: 'app-qr-generate',
  imports: [QRCodeComponent, ButtonIcon],
  templateUrl: './qr-generate.html',
  styleUrl: './qr-generate.css',
})
export class QrGenerate {
  qrData = model('');
  opened = model<boolean>(false);

  closedQrGenerate = () : void => {
    this.opened.set(false);
  }
}
