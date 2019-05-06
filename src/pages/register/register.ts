/**
 * @Author: Ruben
 * @Date:   2017-10-26T00:34:08-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-18T00:19:19-07:00
 */



import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ViewController, LoadingController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Validator } from '../../providers/validators/validators';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import * as _ from 'lodash';
import { ProfilePage } from '../profile/profile';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';


/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  termsCb: boolean = false
  hideClose: boolean = false
  token: any;


  usernameTaken: boolean = false

  public registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(9)]]
  }
  );

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public navParams: NavParams, public fb: FormBuilder, private val: Validator, public alertCtrl: AlertController, public viewCtrl: ViewController, private client: ClientProvider, private rt: RtProvider, private facebook: Facebook, private googlePlus: GooglePlus) {
    this.hideClose = this.navParams.get('hideClose')
  }

  dismiss() {
    this.navCtrl.parent.getActive().dismiss()
  }


  ionViewDidLoad() {
    //console.log('ionViewDidLoad RegisterPage');
  }

  checkboxChange() {
    this.registerForm.patchValue({ agreed: this.termsCb })
  }

  openTerms() {
    this.navCtrl.push("AboutTermsAndConditionsPage")
  }

  openPolicy() {
    this.navCtrl.push("AboutPrivacyPolicyPage")
  }

  register(user) {

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
            this.register(form);
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
      content: 'Registering, please wait ...',
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
                subTitle: `Account was found. Welcome back ${form.firstName} ${form.lastName}`,
                buttons: ['OK']
              })
              alert.present()
              this.navCtrl.parent.getActive().dismiss()
            }, err => {
              this.completeSignup(form)
              loading.dismiss();
            });
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
        let data: any = result;
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

  checkEmail() {


    let email = this.registerForm.controls.email.value


    this.rt.checkEmail(email).then(email => {
      console.log(email)
      if (email.exists) {
        this.registerForm.controls.email.setErrors({ 'taken': true });
      }
    },
      err => {
        this.registerForm.controls.email.setErrors({ 'taken': true });
      })

    // this.client.checkEmail(data).then(res=>{
    //
    //   var arr = this.registerForm.controls.email.errors
    //   // this.registerForm.controls.email.setErrors(_.omit(arr, 'taken'));
    // },
    // error =>{
    //   this.registerForm.controls.email.setErrors({'taken': true});
    // })
  }

  getErrors() {
    console.log(this.registerForm.errors)
    console.log(this.registerForm.controls.username.errors)
    console.log(this.registerForm.controls.email.errors)
    console.log("Valid? ", this.registerForm.valid)
    console.log("Form ", this.registerForm.controls)

  }

  login() {
    console.log('login')
    this.navCtrl.setRoot('LoginPage');
  }
}
