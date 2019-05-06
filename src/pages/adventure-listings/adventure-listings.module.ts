import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdventureListingsPage } from './adventure-listings';

@NgModule({
  declarations: [
    AdventureListingsPage,
  ],
  imports: [
    IonicPageModule.forChild(AdventureListingsPage),
  ],
})
export class AdventureListingsPageModule {}
