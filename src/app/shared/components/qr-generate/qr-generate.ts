import { Component, input, output } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { ButtonIcon } from '../button-icon/button-icon';

@Component({
  selector: 'app-qr-generate',
  imports: [QRCodeComponent, ButtonIcon],
  templateUrl: './qr-generate.html',
  styleUrl: './qr-generate.css',
})
export class QrGenerate {
  qrData = input('');
  opened = input.required<boolean>();
  closed = output<void>();

  closeModal() {
    this.closed.emit();
  }
}
