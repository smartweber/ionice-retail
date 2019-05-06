/**
 * @Author: Ruben
 * @Date:   2017-12-05T15:40:11-07:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-05T15:40:49-07:00
 */



import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TabsPage } from './tabs';

@NgModule({
  declarations: [
    TabsPage,
  ],
  imports: [
    IonicPageModule.forChild(TabsPage),
  ],
})
export class TabsPageModule {}
