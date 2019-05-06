/**
 * @Author: Ruben
 * @Date:   2017-10-29T21:00:46-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-17T03:58:27-07:00
 */



import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ItemDetailsPage } from './item-details';




@NgModule({
  declarations: [
    ItemDetailsPage,
  ],
  imports: [

    IonicPageModule.forChild(ItemDetailsPage)
  ]
})
export class ItemDetailsPageModule {}
