import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { RtProvider } from '../../providers/rt/rt';
import { Braintree, ApplePayOptions, PaymentUIOptions, PaymentUIResult } from '@ionic-native/braintree';



@IonicPage()
@Component({
  selector: 'page-subscription-pay',
  templateUrl: 'subscription-pay.html',
})
export class SubscriptionPayPage {

  subscription: any = null;
  ready: boolean = false;
  isAgreed: boolean = false;
  @ViewChild('purchaseButton') purchaseButton: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, private rt: RtProvider, public loadingCtrl: LoadingController, private braintree: Braintree) {
    this.subscription = navParams.get('subscription')

  }

  ionViewWillEnter() {

  }


  ionViewDidLoad() {
    //console.log('ionViewDidLoad SubscriptionPayPage');
  }
  ionViewDidEnter() {
    //this.enroll();
  }
  changeSubscription() {

    this.navCtrl.pop()
  }

  enroll() {

    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()
    this.rt.getBtToken().then(result => {
      let token = result.clientToken
      const appleOptions: ApplePayOptions = {
        merchantId: 'merchant.reeltrail.llc.production',
        currency: 'USD',
        country: 'US'
      };
      console.log('apple options ', JSON.stringify(appleOptions))
      const paymentOptions: PaymentUIOptions = {
        amount: this.subscription.price,
        primaryDescription: 'Monthly Subscription Fee'
      };

      this.braintree.initialize(token)
        .then(() => {
          this.braintree.setupApplePay(appleOptions).then(pay => { }, err => { console.log(err) })
          this.braintree.presentDropInPaymentUI(paymentOptions).then((result: PaymentUIResult) => {
            if (result.userCancelled) {
              console.log("User cancelled payment dialog.");
            } else {
              console.log("User successfully completed payment!");
              console.log("Payment Nonce: " + result.nonce);
              console.log("Payment Result.", result);
              let loading = this.loadingCtrl.create({
                content: 'Processing payment ...',
                spinner: 'dots'
              });
              loading.present()
              this.rt.buySubscription(this.subscription.slug, result.nonce).then(result => {
                loading.dismiss()
                let alert = this.alertCtrl.create({
                  title: 'REELTRAIL',
                  subTitle: 'Your subscription was been successfully updated!',
                  buttons: ['OK']
                })
                alert.present()
                this.navCtrl.pop()
              }, error => {
                loading.dismiss()
                let alert = this.alertCtrl.create({
                  title: 'REELTRAIL',
                  subTitle: 'There was an error enrolling you into the subscription you selected, please try again later',
                  buttons: ['OK']
                })
                alert.present()
              })
            }
          }, err => {
            console.log(err)
            loading.dismiss()
            let alert = this.alertCtrl.create({
              title: 'REELTRAIL',
              subTitle: 'There was an error adding your payment method, please verify that its valid.',
              buttons: ['OK']
            })
            alert.present()
          })
        }, err => {
          let alert = this.alertCtrl.create({
            title: 'REELTRAIL',
            subTitle: 'There was an error, please try again later',
            message: JSON.stringify(err),
            buttons: ['OK']
          })
          alert.present()
          console.log(err)
        })
    }, err => {
      let alert = this.alertCtrl.create({
        title: 'REELTRAIL',
        subTitle: 'There was an error, please try again later',
        message: JSON.stringify(err),
        buttons: ['OK']
      })
      alert.present()
      console.log(err)
    })
  }




  goServiceAgreement() {
    this.navCtrl.push('SubscriptionServiceAgreementPage');
  }
}
