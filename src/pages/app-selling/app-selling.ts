import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the AppSellingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-app-selling',
  templateUrl: 'app-selling.html',
})
export class AppSellingPage {

  items: any = [
    {title: 'Offer Updates', text: 'Notify me when I receive an offer or counteroffer', checked: true},
    {title: 'Order Updates', text: 'Notify me with updates about an item I\'ve sold', checked: true},
    {title: 'Listing Help', text: 'Notify me when an item can be relisted or edited to improve chance of sale', checked: true},
  ];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad AppSellingPage');
  }

}
