import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MerchandisePage } from './merchandise';

@NgModule({
  declarations: [
    MerchandisePage,
  ],
  imports: [
    IonicPageModule.forChild(MerchandisePage),
  ],
})
export class MerchandisePageModule {}
