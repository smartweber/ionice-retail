/**
 * @Author: Ruben
 * @Date:   2017-11-04T02:16:22-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-09T16:05:43-07:00
 */



import { Component } from '@angular/core';
import { IonicPage, ToastController, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { Events } from 'ionic-angular';
import { Braintree, ApplePayOptions, PaymentUIOptions, PaymentUIResult } from '@ionic-native/braintree';

/**
 * Generated class for the NewItemstep4Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-new-item-step4',
  templateUrl: 'new-item-step4.html',
})
export class NewItemStep4Page {



  voucher: string;
  submitted: boolean = false;
  applying: boolean = false;
  discount: number = 0;
  tracking_id: string = '';
  title: string = ""
  category: string = ""
  prevData: any = null
  oldData: any = null
  price: string = ""


  total: number = 0

  pageTitle: string = "NEW ITEM"


  options: Array<any> = []


  loggedIn: boolean = false
  hasFunding: boolean = false

  constructor(public fb: FormBuilder, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private events: Events, private braintree: Braintree, private toastCtrl: ToastController) {

    this.prevData = navParams.get("data")
    this.oldData = navParams.get("oldData")
    console.log(this.oldData);


    this.events.subscribe('auth:event', (event) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      console.log('----User Logged In ', event);

      switch (event) {
        case 'loggedIn':
          // this.updateTabs()
          this.reload()
          break
        case 'loggedOut':
          // this.updateTabs()
          break
      }
    })
  }
  applyDiscount(type, value) {
    switch (type) {
      case 'PERCENT':
        this.discount = (this.total * value / 100);

        break;
      case 'AMOUNT':
        this.discount = value;
        break;
    }
  }

  apply() {
    this.applying = true;
    this.rt.validateVoucher(this.voucher, this.total).then(voucher => {
      this.applying = false;
      if (voucher.valid) {
        let toast = this.toastCtrl.create({
          message: "Coupon applied successfully",
          duration: 5000,
          position: 'top'
        });
        toast.present();
        if (voucher.discount && voucher.discount.type == 'PERCENT') {
          this.discount = voucher.discount.percent_off ? (voucher.discount.percent_off / 100 * this.total) : voucher.discount.discount_amount;
        } else if (voucher.discount && voucher.discount.type == 'AMOUNT') {
          this.discount = voucher.discount.amount_off
        }
      } else {
        let alert = this.alertCtrl.create({
          title: 'ERROR',
          subTitle: (voucher.reason as String).replace(/voucher/g, 'Coupon'),
          buttons: ['OK']
        })
        alert.present()
        this.discount = 0;
        this.tracking_id = '';
      }
    }, err => {
      this.applying = true;
      this.discount = 0;
      this.tracking_id = '';
    })
  }

  setAddress() {
    this.navCtrl.push("AddressesPage")

  }

  ionViewDidLoad() {


  }

  ionViewWillEnter() {
    this.reload()
  }

  ionViewWillUnload() {
    this.events.unsubscribe('auth:event')
  }



  reload() {

    this.options = []
    this.title = this.prevData.title
    this.price = parseFloat(this.prevData.price || 0).toFixed(2).replace('.00', '')
    this.category = this.prevData.category.level_1.name + ">" + this.prevData.category.level_1.name + ">" + this.prevData.category.level_1.name
    this.loggedIn = this.rt.isLoggedIn()
    if (this.options.length == 0) {
      this.rt.getListingOptions().then(options => {

        if (this.oldData) {
          _.forEach(options, option => {
            if (_.includes(this.oldData.listingOptions, option.slug)) {
              option.disabled = true
              this.options.push(option)
            }
            else {
              this.options.push(option)
            }
          });
        }
        else {
          this.options = options
        }


      })
    }

    if (this.loggedIn) {

      this.rt.getFunding().then(account => {
        console.log('funding ', account)
        if (account.funding) {
          this.hasFunding = true
        }
        else {
          this.hasFunding = false
        }
      },
        err => {
          this.hasFunding = false
          console.log('funding error ', err)
        })
    }

  }

  update(option) {

    console.log(option)

    this.total = 0
    _.forEach(this.options, (option) => {
      if (option.selected) {
        this.total += option.price
      }
    })


  }

  clearCache() {

    localStorage.removeItem('step1')
    localStorage.removeItem('step2')
    localStorage.removeItem('step3')
  }

  join() {
    this.events.publish('open:modal', 'login')
  }

  addFunding() {
    this.navCtrl.push("StoreSettingsPage");
  }

  list() {

    var listingOptions = []
    _.forEach(this.options, (option) => {
      if (option.selected) {
        listingOptions.push(option.slug)
      }
    })

    let data = this.prevData

    //with listing options
    if (this.total > 0) {

      let loading = this.loadingCtrl.create({
        content: 'Loading ...',
        spinner: 'dots'
      });

      loading.present()

      this.rt.getBtToken().then(result => {

        let token = result.clientToken
        loading.dismiss()

        const paymentOptions: PaymentUIOptions = {
          amount: this.total.toFixed(2),
          primaryDescription: 'Premiun listing options',
        };
        const appleOptions: ApplePayOptions = {
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
                if (this.oldData) {
                  let loading = this.loadingCtrl.create({
                    content: 'Listing ...',
                    spinner: 'dots'
                  });

                  loading.present()

                  this.rt.editGear(this.oldData._id, data, listingOptions, result.nonce, this.discount, this.tracking_id, this.voucher).then(result => {
                    loading.dismiss()
                    let alert = this.alertCtrl.create({
                      title: 'REELTRAIL',
                      subTitle: 'Your gear was updated successfully!',
                      buttons: ['OK']
                    })
                    alert.present()
                    this.navCtrl.parent.getActive().dismiss()

                  },
                    error => {
                      loading.dismiss()
                      let alert = this.alertCtrl.create({
                        title: 'REELTRAIL',
                        subTitle: 'There was an error updating your gear, please try again later',
                        buttons: ['OK']
                      })
                      alert.present()
                    })
                }
                else {
                  let loading = this.loadingCtrl.create({
                    content: 'Listing ...',
                    spinner: 'dots'
                  });

                  loading.present()

                  this.rt.listGear(data, listingOptions, result.nonce, this.discount, this.tracking_id, this.voucher).then(result => {
                    loading.dismiss()
                    let alert = this.alertCtrl.create({
                      title: 'REELTRAIL',
                      subTitle: 'Your gear was listed successfully!',
                      buttons: ['OK']
                    })
                    alert.present()
                    this.navCtrl.parent.getActive().dismiss()

                  },
                    error => {
                      loading.dismiss()
                      let alert = this.alertCtrl.create({
                        title: 'REELTRAIL',
                        subTitle: 'There was an error listing your gear, please try again later',
                        buttons: ['OK']
                      })
                      alert.present()
                    })
                }
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
          },
            err => {
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
    //No listing options
    else {

      if (this.oldData) {
        let loading = this.loadingCtrl.create({
          content: 'Listing ...',
          spinner: 'dots'
        });

        loading.present()

        this.rt.editGear(this.oldData._id, data, listingOptions, null, this.discount, this.tracking_id, this.voucher).then(result => {
          loading.dismiss()
          let alert = this.alertCtrl.create({
            title: 'REELTRAIL',
            subTitle: 'Your gear was updated successfully!',
            buttons: ['OK']
          })
          alert.present()
          this.navCtrl.parent.getActive().dismiss()

        },
          error => {
            loading.dismiss()
            let alert = this.alertCtrl.create({
              title: 'REELTRAIL',
              subTitle: 'There was an error updating your gear, please try again later',
              buttons: ['OK']
            })
            alert.present()
          })
      }
      else {
        let loading = this.loadingCtrl.create({
          content: 'Listing ...',
          spinner: 'dots'
        });

        loading.present()

        this.rt.listGear(data, listingOptions, "", this.discount, this.tracking_id, this.voucher).then(result => {
          loading.dismiss()
          let alert = this.alertCtrl.create({
            title: 'REELTRAIL',
            subTitle: 'Your gear was updated successfully!',
            buttons: ['OK']
          })
          alert.present()
          this.navCtrl.parent.getActive().dismiss()

        },
          error => {
            loading.dismiss()
            let alert = this.alertCtrl.create({
              title: 'REELTRAIL',
              subTitle: 'There was an error updating your gear, please try again later',
              buttons: ['OK']
            })
            alert.present()
          })
      }
    }
  }

  goBack() {
    this.navCtrl.pop();
  }
}
