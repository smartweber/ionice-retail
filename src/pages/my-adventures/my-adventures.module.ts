import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyAdventuresPage } from './my-adventures';

@NgModule({
  declarations: [
    MyAdventuresPage,
  ],
  imports: [
    IonicPageModule.forChild(MyAdventuresPage),
  ],
})
export class MyAdventuresPageModule {}
