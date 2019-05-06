import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShippingLabelPage } from './shipping-label';
import { DirectivesModule } from '../../directives/directives.module'

@NgModule({
  declarations: [
    ShippingLabelPage,
  ],
  imports: [
    DirectivesModule,
    IonicPageModule.forChild(ShippingLabelPage),
  ],
})
export class ShippingLabelPageModule { }
