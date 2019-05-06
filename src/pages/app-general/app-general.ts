import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the AppGeneralPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-app-general',
  templateUrl: 'app-general.html',
})
export class AppGeneralPage {

  items: any = [
    {title: 'Message Received', text: 'Notify me when I receive a message from a ReelTrail member', checked: true},
    {title: 'Daily Deals', text: 'Notify me with ReelTrail\'s top deal of the day', checked: false},
    {title: 'Events and Offers', text: 'Notify me about what\'s trending, special deals and events, coupons and other offers', checked: true},
  ];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad AppGeneralPage');
  }

}
