import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SubscriptionPayPage } from './subscription-pay';

@NgModule({
  declarations: [
    SubscriptionPayPage,
  ],
  imports: [
    IonicPageModule.forChild(SubscriptionPayPage),
  ],
})
export class SubscriptionPayPageModule {}
