/**
 * @Author: Ruben
 * @Date:   2017-11-02T01:28:08-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-17T04:11:15-07:00
 */



import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the AboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad AboutPage');
  }

  open(page){
    this.navCtrl.push(page)
  }

}
