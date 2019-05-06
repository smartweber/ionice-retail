import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PurchaseOrderDetailsPage } from './purchase-order-details';

@NgModule({
  declarations: [
    PurchaseOrderDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(PurchaseOrderDetailsPage),
  ],
})
export class PurchaseOrderDetailsPageModule {}
