import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddTrackingPage } from './add-tracking';

@NgModule({
  declarations: [
    AddTrackingPage,
  ],
  imports: [
    IonicPageModule.forChild(AddTrackingPage),
  ],
})
export class AddTrackingPageModule {}
