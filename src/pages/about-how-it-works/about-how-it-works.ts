import { Component } from '@angular/core';
import { IonicPage,Events, NavController, NavParams } from 'ionic-angular';
import { RtProvider } from '../../providers/rt/rt';

/**
 * Generated class for the AboutHowItWorksPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about-how-it-works',
  templateUrl: 'about-how-it-works.html',
})
export class AboutHowItWorksPage {
  public seoContent:string='';

  constructor(private rt: RtProvider,public events:Events,public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.rt.getPage('payment-fees').then((page: any) => {
    if (page && page.pageHtml) {
      this.seoContent = page.pageHtml;
    }
  }, err => {

  });
  }
  sell(){
    //this.navCtrl.pop();
    this.events.publish('tab:select','sell');
  }

}
