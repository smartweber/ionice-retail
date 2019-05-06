import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewItemStep3Page } from './new-item-step3';
import {DirectivesModule} from '../../directives/directives.module'


@NgModule({
  declarations: [
    NewItemStep3Page
  ],
  imports: [
    DirectivesModule,
    IonicPageModule.forChild(NewItemStep3Page),
  ],
})
export class NewItemStep3PageModule {}
