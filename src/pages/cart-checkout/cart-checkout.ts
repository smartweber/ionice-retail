import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { ItemSliding } from 'ionic-angular';
import * as _ from 'lodash';
import { Braintree, ApplePayOptions, PaymentUIOptions, PaymentUIResult } from '@ionic-native/braintree';

/**
 * Generated class for the CartCheckoutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cart-checkout',
  templateUrl: 'cart-checkout.html',
})
export class CartCheckoutPage {



  cart: any

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController, private braintree: Braintree) {

    this.cart = navParams.get("cart")
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad CartCheckoutPage');


  }

  ionViewWillEnter() {
    this.reload()
  }

  details(id) {
    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()
    this.client.getListingItem(id).then((item) => {
      loading.dismiss()
      console.log(item)
      this.navCtrl.push("ItemDetailsPage", { item: item, preview: true })

    })
  }

  reload() {

    // this.rt.cartCheckout().then(result => {
    //   loading.dismiss()
    //   this.cart = result.cart
    //   console.log(result)
    // })

  }

  buy() {

    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.getBtToken().then(result => {

      let token = result.clientToken
      loading.dismiss()

      const paymentOptions: PaymentUIOptions = {
        amount: this.cart.total.toFixed(2),
        primaryDescription: 'Purchase Items',
      };
      const appleOptions: ApplePayOptions = {
        //displayName:'ReelTrail LLC',
        merchantId: 'merchant.reeltrail.llc.production',
        currency: 'USD',
        country: 'US'
      };

      this.braintree.initialize(token)
        .then(() => {
          this.braintree.setupApplePay(appleOptions).then(pay=>{},err=>{console.log(err)})
              this.braintree.presentDropInPaymentUI(paymentOptions).then((result: PaymentUIResult) => {
                if (result.userCancelled) {
                  console.log("User cancelled payment dialog.");
                } else {
                  console.log("User successfully completed payment!");
                  console.log("Payment Nonce: " + result.nonce);
                  console.log("Payment Result.", result);

                  let loading = this.loadingCtrl.create({
                    content: 'Placing your order ...',
                    spinner: 'dots'
                  });

                  loading.present()

                  this.rt.placeOrder(this.cart.order_id, result.nonce).then(result => {
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
                }
              },
                err => {
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
                buttons: ['OK']
              })
              alert.present()
              console.log(err)
            })
        })

  }




}
