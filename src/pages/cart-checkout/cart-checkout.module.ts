import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CartCheckoutPage } from './cart-checkout';

@NgModule({
  declarations: [
    CartCheckoutPage,
  ],
  imports: [
    IonicPageModule.forChild(CartCheckoutPage),
  ],
})
export class CartCheckoutPageModule {}
