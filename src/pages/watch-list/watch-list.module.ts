import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WatchListPage } from './watch-list';

@NgModule({
  declarations: [
    WatchListPage,
  ],
  imports: [
    IonicPageModule.forChild(WatchListPage),
  ],
})
export class WatchListPageModule {}
