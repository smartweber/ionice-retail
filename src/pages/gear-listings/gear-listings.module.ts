import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GearListingsPage } from './gear-listings';

@NgModule({
  declarations: [
    GearListingsPage,
  ],
  imports: [
    IonicPageModule.forChild(GearListingsPage),
  ],
})
export class GearListingsPageModule {}
