/**
 * @Author: Ruben
 * @Date:   2017-11-02T01:19:50-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-13T15:15:54-07:00
 */



import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import * as moment from 'moment'
/**
 * Generated class for the FeedbackPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage {

  feedbackReceived : Array<any> = []
  feedbackSent : Array<any> = []
  feedback : Array<any> = []
  myEmail : string = ""
  type: string = "received";

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider,  private rt: RtProvider, public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad FeedbackPage');
  }

  ionViewWillEnter(){

    this.reload()

  }

  parseDate(date){
    return moment(date).format('DD/MM/YY')
  }

  reload(){

    this.myEmail = this.rt.getUser().email

    this.feedbackReceived = []
    this.feedback = []
    this.feedbackSent = []

    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.getAllFeedback().then(list =>{
      loading.dismiss()
      this.feedback = list.feedback
      console.log('feedback ', this.feedback)
    },
    err =>{

    })

  }

  sendFeedback(feedback){
    this.navCtrl.push("SendFeedbackPage",{feedback:feedback})
  }

  

  getImage(url){

    if(url.indexOf("img/defaultImage.png") == 0){
      return "assets/imgs/defaultImage.png"
    }
    else{
      return url
    }

  }

  info(){

    let alert = this.alertCtrl.create({
      title: 'REELTRAIL',
      subTitle: 'Swipe left to view more options.',
      buttons: ['OK']
    })
    alert.present()

  }

}
