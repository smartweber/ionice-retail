import { Directive, Input, HostListener, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

export class MaskModel {
  mask: string;
  len: number;
  person: boolean;
  phone: boolean;
  numeric: boolean = false;
  money: boolean;
  percent: boolean;
  type: 'alfa' | 'num' | 'all' = 'alfa';
  decimal: number = 2;
  decimalCaracter: string = `,`;
  thousand: string;
}
@Directive({
  selector: '[money-input-mask]' // Attribute selector
})
export class InputMaskDirective implements OnInit {
  @Input() masker: MaskModel;
  constructor(private control: NgControl) {

  }
  ngOnInit() {
    
  }
  private moneyMask(value: any, config: MaskModel): string {
    const decimal = config.decimal || this.masker.decimal;

    value = value
      .replace(/\D/gi, '')
      .replace(new RegExp("([0-9]{" + decimal + "})$", "g"), config.decimalCaracter + '$1');
    if (value.length === decimal + 1) {
      return "0" + value; // leading 0 so we're not left with something weird like ",50"
    } else if (value.length > decimal + 2 && value.charAt(0) === '0') {
      return value.substr(1); // remove leading 0 when we don't need it anymore
    }

    return value;
  }
  @HostListener('keydown', ['$event']) onKeyDown(event) {
    let e = <KeyboardEvent> event;
    if (this.masker.money || this.masker.numeric) {
      if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A
        (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+C
        (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+V
        (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+X
        (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
          // let it happen, don't do anything
          return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
      }
  }
  @HostListener('keyup', ['$event']) onKeyPress(event) {
    if (this.masker.money) {
        let val = this.moneyMask(this.control.value, this.masker);
        this.control.control.setValue(val) 
    }
  }
}
