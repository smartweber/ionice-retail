import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController, AlertController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import * as _ from 'lodash';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  priority: 'high'
})
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  token: any;

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public fb: FormBuilder, public loadingCtrl: LoadingController, private client: ClientProvider,  private rt: RtProvider,private facebook: Facebook,private googlePlus: GooglePlus) {

  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad LoginPage');
  }

  completeSignup(form: any) {
    let prompt = this.alertCtrl.create({
      title: 'Specify the password you will use on ReelTrail',
      message: `Account with an associated social information (name, and email) doesn't already exist. 
      Please specify the password you will use on this site`,     
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            
          }
        },
        {
          text: 'Save Password',
          handler: data => {
            form.password = data.password;
            this.signup(form);
          }
        }
      ]
    });
    prompt.addInput({
      type: 'password',
      name: 'password',
      label: 'Password',
      placeholder: 'Your password',
      checked: true
    });

    prompt.present();
  }

  loginWithFB() {
    let loading = this.loadingCtrl.create({
      content: 'Signing you in, please wait ...',
      spinner: 'dots'
    });
    loading.present()
    this.facebook.login(['public_profile', 'user_friends', 'email'])
      .then((result: FacebookLoginResponse) => {
        this.token = result;
        let data: any = result.authResponse;
        let profile: any = {};
        let form: any = undefined;
        if (result.status == 'connected') {
          loading.setContent('Signing you in. Please hold...');
          this.facebook.api('/me?fields=first_name,last_name,name,email', ["public_profile"]).then(response => {
            data.email = response.email;
            form = {
              firstName: response.first_name, lastName: response.last_name, email: response.email,
            }
            this.rt.loginwithFacebook(data).then(res => {
              loading.dismiss();
              let alert = this.alertCtrl.create({
                title: 'Welcome!',
                subTitle: 'Welcome back',
                buttons: ['OK']
              })
              alert.present()
              this.navCtrl.parent.getActive().dismiss()
            }, err => this.completeSignup(form));
          });
        }
      },
        err => {
          loading.dismiss()
          let alert = this.alertCtrl.create({
            title: 'REELTRAIL',
            subTitle: 'Oops, there was a problem creating your account, please check your infomation and try again.',
            buttons: ['OK']
          })
          alert.present()
        });
  }
  googleLogin() {
    let loading = this.loadingCtrl.create({
      content: 'Registering, please wait ...',
      spinner: 'dots'
    });
    loading.present()
    this.googlePlus.login({
      webClientId: '400447973316-8i8uf1qmio29i77spnsfs3balrfug00k.apps.googleusercontent.com'
    })
      .then((result) => {
        console.log(result);
        this.token = result;
        let form: any = {
          firstName: result.givenName, lastName: result.familyName, email: result.email
        }
        loading.setContent('Signing you in. Please hold...');
        this.rt.loginwithGoogle({ idToken: result.idToken, accessToken: result.accessToken, refreshToken: result.accessToken }).then(res => {
          loading.dismiss();
          let alert = this.alertCtrl.create({
            title: 'Welcome!',
            subTitle: `Account was found. Welcome back ${form.firstName} ${form.lastName}`,
            buttons: ['OK']
          })
          alert.present()
          this.navCtrl.parent.getActive().dismiss()
        }, err => {
          this.completeSignup(form)
          loading.dismiss();
        });
      },
        err => {
          console.log(err)
          loading.dismiss()
          let alert = this.alertCtrl.create({
            title: 'REELTRAIL',
            subTitle: 'Oops, there was a problem creating your account, please check your infomation and try again.',
            buttons: ['OK']
          })
          alert.present()
        });
  }
  dismiss() {
    this.navCtrl.parent.getActive().dismiss()
  }

  login(user) {

    let loading = this.loadingCtrl.create({
      content: 'Logging In, Please wait.',
      spinner: 'dots'
    })
    loading.present()

    this.rt.login(user).then(result =>{
      console.log(result)
      loading.dismiss()
      this.navCtrl.parent.getActive().dismiss()
    },
    err =>{
      console.log(err)
      loading.dismiss()
      let alert = this.alertCtrl.create({
        title: 'REELTRAIL',
        subTitle: 'Please check your credentials and try again.',
        buttons: ['OK']
      });
      alert.present();
    })
    //TODO check here
    // this.client.login(user).then(res => {
    //   loading.dismiss()
    //   if (res) {
    //     if (this.navParams.get('fromWhere') == 'itemStep4') {
    //       this.navCtrl.push("NewItemStep4Page", {data: this.navParams.get('data'), oldData: this.navParams.get('oldData')});
    //     } else {
    //       this.navCtrl.parent.getActive().dismiss()
    //     }
    //   }
    //   else {
    //     let alert = this.alertCtrl.create({
    //       title: 'REELTRAIL',
    //       subTitle: 'Please check your credentials and try again.',
    //       buttons: ['OK']
    //     });
    //     alert.present();
    //   }
    //
    // })

  }

  register() {
    this.navCtrl.push("RegisterPage", {hideClose:true})
  }

  forgotPassword() {
    this.navCtrl.push("ResetPasswordPage")

  }

  signup(user) {

    let loading = this.loadingCtrl.create({
      content: 'Registering, please wait ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.register(_.omit(user, ['agreedToTerms'])).then(result => {
      loading.dismiss()
      console.log("register ", result);

      let alert = this.alertCtrl.create({
        title: 'Welcome!',
        subTitle: 'Please check your email, and follow the instructions we sent you to verify your new account.',
        buttons: ['OK']
      })
      alert.present()

      this.navCtrl.parent.getActive().dismiss()


    },
      err => {
        loading.dismiss()
        console.log("register error", err)
        // let msg = err.message || ''
        let alert = this.alertCtrl.create({
          title: 'REELTRAIL',
          subTitle: 'Oops, there was a problem creating your account, please check your infomation and try again.',
          buttons: ['OK']
        })
        alert.present()
      })
  }

}
