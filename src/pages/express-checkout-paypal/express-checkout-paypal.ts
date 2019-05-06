import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { ItemSliding,App } from 'ionic-angular';
import * as _ from 'lodash';
import { Braintree} from '@ionic-native/braintree';
import { PayPal } from '@ionic-native/paypal';
import { InAppBrowser } from '@ionic-native/in-app-browser';
 

declare var paypal: any;

/**
 * Generated class for the ExpressCheckoutPaypalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-express-checkout-paypal',
  templateUrl: 'express-checkout-paypal.html',
})
export class ExpressCheckoutPaypalPage {


  sale: any
  item: any
  shippingAddress: any
  qty: number
  payKey: any
  mode: string = 'sandbox';
  paypalToken: string = '';

  constructor(public app:App,public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController, private braintree: Braintree, private paypal: PayPal, private iab: InAppBrowser) {

    this.sale = navParams.get("sale")
    this.item = navParams.get("item")
    this.shippingAddress = navParams.get("shippingAddress")
    this.qty = navParams.get("qty")

    
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad CartCheckoutPage');
  }

  ionViewWillEnter() {
    this.rt.paypalMode().then(r => {
      this.mode = r.mode
      this.reload()
    }, e => null)
  }

  reload() {
    setTimeout(() => {
      paypal.Button.render({
        env: this.mode == 'sandbox' ? 'sandbox' : 'production',
        commit: true, // Show a 'Pay Now' button
        style: {
          color: 'gold',
          size: 'small'
        },
        payment: (data, actions) => {
          return this.rt.expressCheckoutPaypal(this.item._id, this.qty, this.shippingAddress).then(sale => {            
            this.sale = sale
            this.paypalToken = sale.order.id
            return sale.order.id;
          },
            err => {
              let alert = this.alertCtrl.create({
                title: 'REELTRAIL',
                subTitle: 'There was an error, please try again later',
                buttons: ['OK']
              })
              alert.present()
            })
        },
        onAuthorize: (data, actions) => {
          let loading = this.loadingCtrl.create({
            content: 'Placing order. Please hold...',
            spinner: 'dots'
          });
      
          loading.present()
          this.rt.completePaypalCartOrder({ qty: this.qty, gearId: this.item._id, paypalToken: this.paypalToken, shipping_address: this.shippingAddress })
            .then((p: any) => {
              loading.dismiss()
              let alert = this.alertCtrl.create({
                title: 'REELTRAIL',
                subTitle: 'Your order has been placed!',
                buttons: ['OK']
              })
              const index = this.navCtrl.getActive().index;
              this.navCtrl.push("MyPurchasesPage").then(() => {
                this.navCtrl.remove(1, index);
                alert.present()
              });

            },
              error => {
                loading.dismiss()
                let alert = this.alertCtrl.create({
                  title: 'REELTRAIL',
                  subTitle: 'There was an error placing your order, please try again later',
                  buttons: ['OK']
                })
                alert.present()
              })
        },

        onCancel: function (data, actions) {
          /*
           * Buyer cancelled the payment
           */
        },

        onError: function (err) {
          /*
           * An error occurred during the transaction
           */
        }
      }, '#paypal-button');
    }, 200);

  }

  buy() {
    const browser = this.iab.create('https://www.paypal.com/webapps/adaptivepayment/flow/pay?expType=mini&paykey=' + this.sale.payKey, '_blank', "location=no");
    browser.on('exit').subscribe(event => {
      this.purchase();
    });
    browser.on('loaderror').subscribe(event => {
      browser.close();
    });
  }

  purchase() {
    this.rt.completePaypalCartOrder({ qty: this.qty, gearId: this.item._id, paypalToken: this.paypalToken, shipping_address: this.shippingAddress })
      .then((p: any) => {
        let alert = this.alertCtrl.create({
          title: 'REELTRAIL',
          subTitle: 'Your order has been placed!',
          buttons: ['OK']
        })
        alert.present()
        this.navCtrl.pop()

      },
        error => {
          let alert = this.alertCtrl.create({
            title: 'REELTRAIL',
            subTitle: 'There was an error placing your order, please try again later',
            buttons: ['OK']
          })
          alert.present()
        })
  }

  buyOld() {

    /* this.paypal.init({
      PayPalEnvironmentProduction: 'access_token$production$hg44g496rwrzt5s7$bd3f6d0216921d2638882e9b5317ae43',
      PayPalEnvironmentSandbox: 'YOUR_SANDBOX_CLIENT_ID'
    }).then(() => {
      // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
      this.paypal.prepareToRender('PayPalEnvironmentProduction', new PayPalConfiguration({
        // Only needed if you get an "Internal Service Error" after PayPal login!
        //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
      })).then(() => {
        let payment = new PayPalPayment(this.sale.total.toFixed(2), 'USD', this.item.title, 'sale');
        this.paypal.renderSinglePaymentUI(payment).then(() => {
          // Successfully paid

          // Example sandbox response
          //
          // {
          //   "client": {
          //     "environment": "sandbox",
          //     "product_name": "PayPal iOS SDK",
          //     "paypal_sdk_version": "2.16.0",
          //     "platform": "iOS"
          //   },
          //   "response_type": "payment",
          //   "response": {
          //     "id": "PAY-1AB23456CD789012EF34GHIJ",
          //     "state": "approved",
          //     "create_time": "2016-10-03T13:33:33Z",
          //     "intent": "sale"
          //   }
          // }
        }, () => {
          // Error or render dialog closed without being successful
        });
      }, () => {
        // Error in configuration
      });
    }, () => {
      // Error in initialization, maybe PayPal isn't supported or something else
    }); */



  }

}
