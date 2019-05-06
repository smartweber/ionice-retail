import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppGeneralPage } from './app-general';

@NgModule({
  declarations: [
    AppGeneralPage,
  ],
  imports: [
    IonicPageModule.forChild(AppGeneralPage),
  ],
})
export class AppGeneralPageModule {}
