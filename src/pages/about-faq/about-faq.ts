import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { RtProvider } from '../../providers/rt/rt';

/**
 * Generated class for the AboutFaqPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about-faq',
  templateUrl: 'about-faq.html',
})
export class AboutFaqPage {
  public seoContent: string = '';

  constructor(private rt: RtProvider, private iab: InAppBrowser, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.rt.getPage('faq').then((page: any) => {
      if (page && page.pageHtml) {
        this.seoContent = page.pageHtml.replace(/_blank/g,'_system');
      }
    }, err => {

    });
  }
  open(url) {
    this.iab.create(url);
  }

}
