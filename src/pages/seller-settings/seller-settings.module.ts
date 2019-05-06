import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SellerSettingsPage } from './seller-settings';

@NgModule({
  declarations: [
    SellerSettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(SellerSettingsPage),
  ],
})
export class SellerSettingsPageModule {}
