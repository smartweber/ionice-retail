import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PleaseLoginPage } from './please-login';

@NgModule({
  declarations: [
    PleaseLoginPage,
  ],
  imports: [
    IonicPageModule.forChild(PleaseLoginPage),
  ],
})
export class PleaseLoginPageModule {}
