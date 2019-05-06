import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SubscriptionServiceAgreementPage } from './subscription-service-agreement';

@NgModule({
  declarations: [
    SubscriptionServiceAgreementPage,
  ],
  imports: [
    IonicPageModule.forChild(SubscriptionServiceAgreementPage),
  ],
})
export class SubscriptionServiceAgreementPageModule {}
