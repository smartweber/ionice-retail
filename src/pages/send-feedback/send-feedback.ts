import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';

/**
 * Generated class for the SendFeedbackPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-send-feedback',
  templateUrl: 'send-feedback.html',
})
export class SendFeedbackPage {

  //ios-star-outline

  stars: Array<string> = ["ios-star-outline", "ios-star-outline", "ios-star-outline", "ios-star-outline", "ios-star-outline"]
  rating: number = 1
  comment: string = ""
  transaction: any

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController) {
    this.transaction = navParams.get("feedback")
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad SendFeedbackPage', this.transaction);
    this.update()
  }

  rate(value) {
    this.rating = value
    this.update()
  }

  update() {

    for (var i = 0; i < this.stars.length; i++) {
      if ((i + 1) / this.rating <= 1) {
        this.stars[i] = "ios-star"
      }
      else {
        this.stars[i] = "ios-star-outline"
      }
    }

  }

  send() {


    let loading = this.loadingCtrl.create({
      content: 'Sending ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.giveFeedback(this.transaction._id, this.comment, this.rating).then(res => {

      loading.dismiss()
      this.navCtrl.pop()

    },
    err => {
      loading.dismiss()

    })

  }

}
