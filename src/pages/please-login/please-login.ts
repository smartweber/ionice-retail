import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';

/**
 * Generated class for the PleaseLoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-please-login',
  templateUrl: 'please-login.html',
})
export class PleaseLoginPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public events: Events) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad PleaseLoginPage');
  }

  login(){
    this.events.publish('open:modal', 'login');
  }

  signup() {
    this.navCtrl.push("RegisterPage");
  }
}
