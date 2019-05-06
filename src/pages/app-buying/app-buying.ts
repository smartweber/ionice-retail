import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the AppBuyingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-app-buying',
  templateUrl: 'app-buying.html',
})
export class AppBuyingPage {

  items: any = [
    {title: 'Item Updates', text: 'Notify me with updates to items I\'m interested in', checked: true},
    {title: 'Offer Updates', text: 'Notify me with updates to offers I\'ve made', checked: true},
    {title: 'Order Updates', text: 'Notify me with updates on items I\'ve purchased', checked: true}
  ];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad AppBuyingPage');
  }

}
