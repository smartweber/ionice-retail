import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MySalesPage } from './my-sales';

@NgModule({
  declarations: [
    MySalesPage,
  ],
  imports: [
    IonicPageModule.forChild(MySalesPage),
  ],
})
export class MySalesPageModule {}
