import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShippingOrderDetailsPage } from './shipping-order-details';

@NgModule({
  declarations: [
    ShippingOrderDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ShippingOrderDetailsPage),
  ],
})
export class ShippingOrderDetailsPageModule {}
