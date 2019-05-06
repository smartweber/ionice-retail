import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExpressCheckoutPaypalPage } from './express-checkout-paypal';

@NgModule({
  declarations: [
    ExpressCheckoutPaypalPage,
  ],
  imports: [
    IonicPageModule.forChild(ExpressCheckoutPaypalPage),
  ],
})
export class ExpressCheckoutPaypalPageModule {}
