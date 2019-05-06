import { NgModule } from '@angular/core';
import {IonicModule,IonicPageModule} from "ionic-angular";
import { CurrencyDirective } from './currency/currency';
import { InputMaskDirective } from './input-mask/input-mask';
@NgModule({
	declarations: [CurrencyDirective,
    InputMaskDirective],
	imports: [ IonicModule],
	exports: [CurrencyDirective,
    InputMaskDirective]
})
export class DirectivesModule {}
