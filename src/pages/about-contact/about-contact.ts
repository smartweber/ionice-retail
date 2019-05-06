import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EmailComposer } from '@ionic-native/email-composer';

/**
 * Generated class for the AboutContactPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about-contact',
  templateUrl: 'about-contact.html',
})
export class AboutContactPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private emailComposer: EmailComposer) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad AboutContactPage');
  }

  email() {
    let email = {
      to: 'support@reeltrail.com',
      subject: 'ReelTrail Support',
      isHtml: true
    };

    this.emailComposer.open(email);
  }

  feedback() {
    let email = {
      to: 'info@reeltrail.com',
      subject: 'ReelTrail Feedback',
      isHtml: true
    };

    this.emailComposer.open(email);
  }
}
