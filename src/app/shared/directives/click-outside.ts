import { Directive, ElementRef, HostListener, inject, output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutside {

  private elementRef = inject(ElementRef);

  appClickOutside = output<void>();

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent):void{
    const clickInside = this.elementRef.nativeElement.contains(event.target);

    if(!clickInside){
      this.appClickOutside.emit();
    }
  }

}
