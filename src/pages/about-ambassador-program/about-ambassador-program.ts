import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EmailComposer } from '@ionic-native/email-composer';

/**
 * Generated class for the AboutAmbassadorProgramPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about-ambassador-program',
  templateUrl: 'about-ambassador-program.html',
})
export class AboutAmbassadorProgramPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private emailComposer: EmailComposer) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad AboutAmbassadorProgramPage');
  }

  email() {
    let email = {
      to: 'info@reeltrail.com',
      subject: 'ReelTrail Feedback',
      isHtml: true
    };

    this.emailComposer.open(email);
  }
}
