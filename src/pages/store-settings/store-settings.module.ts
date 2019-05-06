import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StoreSettingsPage } from './store-settings';

@NgModule({
  declarations: [
    StoreSettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(StoreSettingsPage),
  ],
})
export class StoreSettingsPageModule {}
