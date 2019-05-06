import { Component } from '@angular/core';
import { IonicPage,Platform, ToastController, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { ItemSliding, Events } from 'ionic-angular';
import * as _ from 'lodash';
import { ReplaySubject } from '../../../node_modules/rxjs';
import { Braintree, ApplePayOptions, PaymentUIOptions, PaymentUIResult } from '@ionic-native/braintree';

declare var paypal: any;

@IonicPage()
@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
})
export class CartPage {

  items: Array<any> = []
  cart: any = null
  subTotal: number = 0
  payKey: any
  mode: string = 'sandbox';
  paypalToken: string = '';

  addressId: string = null
  aSOpts = {
    title: 'Choose an Address',
    subTitle: ''
  }
  aOpts: Array<any> = []

  constructor(public platform: Platform,private braintree: Braintree, private toastCtrl: ToastController, private events: Events, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad CartPage')


  }

  ionViewWillEnter() {
    this.rt.paypalMode().then(r => {
      this.mode = r.mode
      this.reload()
    }, e => {
      this.reload()
    });
  }

  dismiss() {
    this.navCtrl.parent.getActive().dismiss()
  }

  reload() {

    this.items = []

    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.getCart().then(res => {
      loading.dismiss()
      if (res.cart) {
        this.subTotal = res.cart.subtotal
        this.cart = res.cart;
        setTimeout(() => { this.renderPaypal(); });
      }
      console.log('cart ', res.cart)
    },
      () => {
        loading.dismiss()
      })

    this.rt.getAllAddresses().then(list => {
      console.log("addreses ", list.addresses)
      this.aOpts = list.addresses
    })
  }

  renderPaypal() {
    try {
      setTimeout(() => {
        if (document.getElementById('paypal-button')) {
          if (document.getElementById('paypal-button').firstChild) {
            document.getElementById('paypal-button').removeChild(document.getElementById('paypal-button').firstChild);
          }
          paypal.Button.render({
            env: this.mode == 'sandbox' ? 'sandbox' : 'production',
            commit: true, // Show a 'Pay Now' button
            style: {
              label: 'checkout',
              color: 'blue',
              size: 'responsive',
              shape: 'rect',
              tagline: false
            },
            payment: (data, actions) => {
              if (this.rt.loggedIn) {
                if (!this.addressId) {
                  let toast = this.toastCtrl.create({
                    message: `Please provide a shipping address to continue.`,
                    duration: 5000,
                    position: 'top'
                  });
                  toast.present();
                  return false;
                } else {
                  let loading = this.loadingCtrl.create({
                    content: 'Checking out. Please hold ...',
                    spinner: 'dots'
                  });
                  loading.present();
                  return this.rt.expressPaypalCheckout({ shipping_address: this.addressId })
                    .then(result => {
                      loading.dismiss()
                      this.cart = result.cart
                      this.paypalToken = result.order.id
                      return result.order.id;
                    }, err => {
                      loading.dismiss()
                    })
                }
              } else {
                let toast = this.toastCtrl.create({
                  message: `You need to be logged in to use this feature.`,
                  duration: 5000,
                  position: 'top'
                });
                toast.present();
                this.events.publish('open:modal', 'login');
              }
            },
            onAuthorize: (data, actions) => {
              let order = this.rt.completePaypalCartOrder({ order_id: this.cart.order_id, paypalToken: this.paypalToken, shipping_address: this.addressId });
              let loading = this.loadingCtrl.create({
                content: 'Placing order. Please hold...',
                spinner: 'dots'
              });
              loading.present()
              return order.then((p: any) => {
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
        }
      }, 200);
    } catch (e) {
      console.log(e)
      console.log("Buton does not exist...")
    }
  }


  addAddress() {

    this.navCtrl.push("AddressesPage")

  }

  delete(id: any, slidingItem: ItemSliding) {
    slidingItem.close()

    let confirm = this.alertCtrl.create({
      title: 'REELTRAIL',
      message: 'Are you sure you want to remove this item from your cart?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Remove',
          handler: () => {
            let loading = this.loadingCtrl.create({
              content: 'Removing ...',
              spinner: 'dots'
            });

            loading.present()
            this.rt.removeGearFromCart(id).then(res => {
              loading.dismiss()
              this.events.publish('cart:remove', id);
              this.reload()
            },
              err => {
                loading.dismiss()
                this.reload()
              })
          }
        }
      ]
    })
    confirm.present()
  }

  details(id) {

  }

  checkout() {
    if (!this.addressId) {
      let toast = this.toastCtrl.create({
        message: `Please provide a shipping address to continue.`,
        duration: 5000,
        position: 'top'
      });
      toast.present();
    } else {
      let loading = this.loadingCtrl.create({
        content: 'Updating Cart ...',
        spinner: 'dots'
      });

      loading.present()
      this.rt.cartCheckout(this.addressId).then(result => {
        console.log("checkout cart ", result)
        loading.dismiss()
        this.cart = result.cart;
        //this.navCtrl.push("CartCheckoutPage", { cart: result.cart })
      },
        err => {
          loading.dismiss()
          let alert = this.alertCtrl.create({
            title: 'REELTRAIL',
            subTitle: 'There was an error checking out your cart.',
            buttons: ['OK']
          })
          alert.present()
        })
    }

  }

  info() {

    let alert = this.alertCtrl.create({
      title: 'REELTRAIL',
      subTitle: 'Swipe left to view more options.',
      buttons: ['OK']
    })
    alert.present()


  }
  buy() {
    if (!this.addressId) {
      let toast = this.toastCtrl.create({
        message: `Please provide a shipping address to continue.`,
        duration: 5000,
        position: 'top'
      });
      toast.present();
    } else {
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
            this.braintree.setupApplePay(appleOptions).then(pay => { }, err => { console.log(err) })
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


}
