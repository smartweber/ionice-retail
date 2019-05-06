import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { IonicPage, NavController, NavParams, AlertController, ViewController , LoadingController } from 'ionic-angular';

import { RtProvider } from '../../providers/rt/rt';
/**
 * Generated class for the ResetPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {

  public form = this.fb.group({

    email: ['', Validators.required],

  });

  constructor(public navCtrl: NavController,  public loadingCtrl: LoadingController, public navParams: NavParams, public fb: FormBuilder ,  public alertCtrl: AlertController, public viewCtrl: ViewController, private rt : RtProvider) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad ResetPasswordPage');
  }

  reset(form){

    let loading = this.loadingCtrl.create({
      content: '',
      spinner: 'dots'
    });

    form.email = form.email.toLowerCase()

    loading.present()

    this.rt.resetPassword(form.email).then(result =>{
      loading.dismiss()
      let alert = this.alertCtrl.create({
        title: 'REELTRAIL',
        subTitle: 'If the email exists in our database, a reset email will be sent',
        buttons: ['OK']
      })
      alert.present()
      this.navCtrl.pop()
    })

  }



}
