import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewAddressPage } from './new-address';

@NgModule({
  declarations: [
    NewAddressPage,
  ],
  imports: [
    IonicPageModule.forChild(NewAddressPage),
  ],
})
export class NewAddressPageModule {}
