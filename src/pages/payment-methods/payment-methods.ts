import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { ItemSliding } from 'ionic-angular';
import * as applepay from 'braintree-web/apple-pay';
import * as braintree from 'braintree-web/client';
import * as paypal from 'braintree-web/paypal';
import * as googlepay from 'braintree-web/google-payment';
import * as visa from 'braintree-web/visa-checkout';

/**
 * Generated class for the PaymentMethodsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-payment-methods',
  templateUrl: 'payment-methods.html',
})
export class PaymentMethodsPage {

  paymentMethods : Array<any> = []

  braintreeIsReady: boolean;
  dropIninstance: any;

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, public loadingCtrl: LoadingController) {

  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad PaymentMethodsPage');
    this.client.getBraintreeToken().then(res => {
      console.log('!!!!!!!!!!!!', res);
      braintree.create({
        authorization: res.clientToken,
        container: '#dropin-container'
      }, (err, dropinInstance) => {
        if (err) {
          // Handle any errors that might've occurred when creating Drop-in
          console.error(err);
          return;
        }
        this.dropIninstance = dropinInstance;
        this.braintreeIsReady = true;

        applepay.create({client: dropinInstance}, (err, applePayInstance) => {
          if (err) {
            // Handle any errors that might've occurred when creating Drop-in
            console.error(err);
            return;
          }
        });

        paypal.create({client: dropinInstance}, (err, paypalInstance) => {
          if (err) {
            // Handle any errors that might've occurred when creating Drop-in
            console.error(err);
            return;
          }
        });

        googlepay.create({client: dropinInstance}, (err, googlePayInstance) => {
          if (err) {
            // Handle any errors that might've occurred when creating Drop-in
            console.error(err);
            return;
          }
        });

        visa.create({client: dropinInstance}, (err, visaInstance) => {
          if (err) {
            // Handle any errors that might've occurred when creating Drop-in
            console.error(err);
            return;
          }

          this.visaCheckoutInitialized(visaInstance);
        });
      });
    });
  }

  ionViewWillEnter(){
    this.reload()
  }

  reload(){
    this.client.getPaymentMethods().then(pms=>{
      this.paymentMethods = pms
    })
  }

  newPaymentMethod(){
    this.dropIninstance.requestPaymentMethod((err, payload) => {
      console.log(err, payload);
      if (err) {
        // deal with error
      }
      else {
        //send nonce to the server

      }
    });
    // this.navCtrl.push("NewPaymentMethodPage")
  }

  mask(number){
    return "●●●● ●●●● ●●●● " + number.substr(number.length - 4) ;
  }

  delete(slide: ItemSliding, card: any){
    slide.close()


    let confirm = this.alertCtrl.create({
      title: 'REELTRAIL',
      message: 'Are you sure you want to delete this payment method?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {

            this.client.deletePaymentMethod(card).then(res=>{
              let loading = this.loadingCtrl.create({
                content: 'Deleting ...',
                spinner: 'dots'
              });

              loading.present()

              setTimeout(()=>{
                loading.dismiss()
                this.reload()
              },1000)

            })

          }
        }
      ]
    })
    confirm.present()



  }

  visaCheckoutInitialized(visaCheckoutInstance) {
    var baseInitOptions = {
      paymentRequest: {
        currencyCode: "USD",
        subtotal: "10.00"
      }
    };
  
    var initOptions = visaCheckoutInstance.createInitOptions(baseInitOptions);
    visa.init(initOptions);
  
    visa.on("payment.success", function (payment) {
      visaCheckoutInstance.tokenize(payment, function (tokenizeErr, payload) {
        if (tokenizeErr) {
          console.error('Error during Visa Checkout tokenization', tokenizeErr);
        } else {
          // Send payload.nonce to your server, and create a transaction there.
          console.log('payload', payload);
        }
      });
    });
  }
}
