import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewPaymentMethodPage } from './new-payment-method';

@NgModule({
  declarations: [
    NewPaymentMethodPage,
  ],
  imports: [
    IonicPageModule.forChild(NewPaymentMethodPage),
  ],
})
export class NewPaymentMethodPageModule {}
