import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the AppSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-app-settings',
  templateUrl: 'app-settings.html',
})
export class AppSettingsPage {

  pages: any = [{name: 'Buying', page: 'AppBuyingPage'}, {name: 'Selling', page: 'AppSellingPage'}, {name: 'General', page: 'AppGeneralPage'}];
  pushChecked: boolean = true;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad AppSettingsPage');
  }

  goPage(page) {
    this.navCtrl.push(page);
  }
}
