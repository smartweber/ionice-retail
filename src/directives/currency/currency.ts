import { Directive , ElementRef, Input, HostListener} from '@angular/core';

/**
 * Generated class for the CurrencyDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[currency]' // Attribute selector
})
export class CurrencyDirective {

  regexStr = '^[0-9]*$';
  @Input() decimals: boolean = false;

  constructor(private el: ElementRef) {
    
  }

  @HostListener('keydown', ['$event']) onKeyDown(event) {

    let e = <KeyboardEvent> event;

    var allowed = [46, 8, 9, 27, 13, 110, 190]
    if(!this.decimals){
      allowed = [46, 8, 9, 27, 13, 110]
    }

    var unallowed = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '='];

    if (unallowed.indexOf(e.key) >= 0) {
      e.preventDefault();
    }


    if (allowed.indexOf(e.keyCode) !== -1 ||
    // Allow: Ctrl+A
    (e.keyCode == 65 && e.ctrlKey === true) ||
    // Allow: Ctrl+C
    (e.keyCode == 67 && e.ctrlKey === true) ||
    // Allow: Ctrl+V
    (e.keyCode == 86 && e.ctrlKey === true) ||
    // Allow: Ctrl+X
    (e.keyCode == 88 && e.ctrlKey === true) ||
    // Allow: home, end, left, right
    (e.keyCode >= 35 && e.keyCode <= 39)) {
      // let it happen, don't do anything
      return;
    }


    let ch = String.fromCharCode(e.keyCode);
    let regEx =  new RegExp(this.regexStr);
    if(regEx.test(ch))
      return;
    else
       e.preventDefault();

  }

}
