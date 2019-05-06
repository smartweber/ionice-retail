import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RtProvider } from '../../providers/rt/rt';

/**
 * Generated class for the AboutPrivacyPolicyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about-privacy-policy',
  templateUrl: 'about-privacy-policy.html',
})
export class AboutPrivacyPolicyPage {

  seoContent:string='';
  constructor(private rt: RtProvider, public navCtrl: NavController, public navParams: NavParams) {
   
  }

  ionViewDidLoad() {
    this.rt.getPage('privacy-policy').then((page: any) => {
      console.log(page);
      if (page && page.pageHtml) {
        this.seoContent = page.pageHtml;
      }
    }, err => {

    });
    //console.log('ionViewDidLoad AboutPrivacyPolicyPage');
  }

}
