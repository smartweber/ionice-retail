import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewItemStep2Page } from './new-item-step2';
import {DirectivesModule} from '../../directives/directives.module'

@NgModule({
  declarations: [
    NewItemStep2Page,
  ],
  imports: [
    DirectivesModule,
    IonicPageModule.forChild(NewItemStep2Page),
  ],
})
export class NewItemStep2PageModule {}
