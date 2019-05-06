/**
 * @Author: Ruben
 * @Date:   2017-10-26T00:33:22-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-07T11:55:46-07:00
 */

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';
import {ClientProvider} from '../../providers/client/client';

/**
 * Generated class for the SellPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sell',
  templateUrl: 'sell.html',
})
export class SellPage {

  counter : number = 0;
  eventNum: number = 0;
  category: string = 'gear';
  title: string = 'Sell Your Gear';

  constructor( public navCtrl: NavController, public navParams: NavParams, public events: Events, private client: ClientProvider) {

  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad SellPage');
    this.client.btnClickCount.subscribe(res => {
      console.log(res);
      this.eventNum = 0;
    });
  }

  ionViewDidEnter(){
    this.counter = this.client.counters.cart;
  }

  features() {
    this.navCtrl.push('AboutHowItWorksPage');
  }

  openCart(){

    this.events.publish('open:modal', 'cart')
  }

  sell(type){
    if (this.eventNum == 0) {
      this.events.publish('open:modal', type);
      this.client.btnClickCount.next(1);
      this.eventNum ++;
    }
  }

  changeCategory() {
    this.title = this.category === 'gear' ? 'Sell Your Gear' : 'Promote Your Adventure';
  }
}
