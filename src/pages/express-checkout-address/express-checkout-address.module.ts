import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExpressCheckoutAddressPage } from './express-checkout-address';

@NgModule({
  declarations: [
    ExpressCheckoutAddressPage,
  ],
  imports: [
    IonicPageModule.forChild(ExpressCheckoutAddressPage),
  ],
})
export class ExpressCheckoutAddressPageModule {}
