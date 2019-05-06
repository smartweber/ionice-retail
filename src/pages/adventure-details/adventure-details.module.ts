/**
 * @Author: Ruben
 * @Date:   2017-11-14T18:41:50-07:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-17T01:39:09-07:00
 */



import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdventureDetailsPage } from './adventure-details';
import { IonicImageViewerModule } from 'ionic-img-viewer';

@NgModule({
  declarations: [
    AdventureDetailsPage,
  ],
  imports: [
    IonicImageViewerModule,
    IonicPageModule.forChild(AdventureDetailsPage),
  ],
})
export class AdventureDetailsPageModule {}
