import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewItemStep1Page } from './new-item-step1';

@NgModule({
  declarations: [
    NewItemStep1Page,
  ],
  imports: [
    IonicPageModule.forChild(NewItemStep1Page),
  ],
})
export class NewItemStep1PageModule {}
