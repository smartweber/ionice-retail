import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EmailComposer } from '@ionic-native/email-composer';

/**
 * Generated class for the AboutJobsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about-jobs',
  templateUrl: 'about-jobs.html',
})
export class AboutJobsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private emailComposer: EmailComposer) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad AboutJobsPage');
  }

  apply() {
    let email = {
      to: 'jobs@reeltrail.com',
      subject: 'ReelTrail Job',
      isHtml: true
    };

    this.emailComposer.open(email);
  }
}
