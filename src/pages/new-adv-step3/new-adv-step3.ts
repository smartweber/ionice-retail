/**
 * @Author: Ruben
 * @Date:   2017-11-04T02:19:20-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-08T23:09:47-07:00
 */



import { Component } from '@angular/core';
import { IonicPage, ToastController, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { RtProvider } from '../../providers/rt/rt';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { Events } from 'ionic-angular';
import { Braintree, ApplePayOptions, PaymentUIOptions, PaymentUIResult } from '@ionic-native/braintree';

/**
 * Generated class for the NewAdvstep3Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-new-adv-step3',
  templateUrl: 'new-adv-step3.html',
})
export class NewAdvStep3Page {


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

  pageTitle: string = "NEW ADVENTURE"


  options: Array<any> = []


  loggedIn: boolean = false
  hasFunding: boolean = true

  constructor(public fb: FormBuilder, public navCtrl: NavController, public navParams: NavParams, private rt: RtProvider, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private events: Events, private braintree: Braintree, private toastCtrl: ToastController) {

    this.prevData = navParams.get("data")
    this.oldData = navParams.get("oldData") 


    this.events.subscribe('auth:event', (event) => {
      // user and time are the same arguments passed in `events.publish(user, time)`      

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
          subTitle: (voucher.reason as String).replace(/voucher/g,'Coupon'),
          buttons: ['OK']
        })
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

    this.title = this.prevData.title
    this.price = parseFloat(this.prevData.price||0).toFixed(2).replace('.00', '')
    this.category = this.prevData.category.level_1.name + ">" + this.prevData.category.level_1.name + ">" + this.prevData.category.level_1.name
    this.loggedIn = this.rt.isLoggedIn()
    this.update()
    if (this.options.length == 0) {
      this.rt.getListingOptions('adventures').then(options => {
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

    // if(this.loggedIn){

    // this.rt.getFunding().then(account =>{
    //     console.log('funding ', account)
    //     if(account.funding){
    //       this.hasFunding = true
    //     }
    //     else{
    //       this.hasFunding = false
    //     }
    // },
    // err =>{
    //   this.hasFunding = false
    //   console.log('funding error ', err)
    // })
    // }

  }

  update() {



    this.total = 0
    this.total += this.prevData.listingDays * 3
    _.forEach(this.options, (option) => {
      if (option.selected) {
        this.total += option.price
      }
    })


  }

  clearCache() {

    localStorage.removeItem('step1')
    localStorage.removeItem('step2')

  }

  join() {
    this.events.publish('open:modal', 'login')
  }

  addFunding() {
    this.navCtrl.push("SellerSettingsPage");
  }

  list() {

    var listingOptions = []
    _.forEach(this.options, (option) => {
      if (option.selected) {
        listingOptions.push(option.slug)
      }
    })

    let listingDays = this.prevData.listingDays

    let data = _.omit(this.prevData, ['listingDays'])

    //pay flow
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
            console.log(this.braintree);
            this.braintree.setupApplePay(appleOptions).then(pay => { }, err => { console.log(err) });
            this.braintree.presentDropInPaymentUI(paymentOptions).then((result: PaymentUIResult) => {
              if (result.userCancelled) {
                console.log("User cancelled payment dialog.");
              } else {
                console.log("User successfully completed payment!");
                console.log("Payment Nonce: " + result.nonce);
                console.log("Payment Result.", result);

                //updating adventure
                if (this.oldData) {
                  let loading = this.loadingCtrl.create({
                    content: 'Updating ...',
                    spinner: 'dots'
                  });

                  loading.present()

                  this.rt.editAdventure(this.oldData, data, listingOptions, listingDays, result.nonce,this.discount,this.tracking_id, this.voucher).then(result => {
                    loading.dismiss()
                    let alert = this.alertCtrl.create({
                      title: 'REELTRAIL',
                      subTitle: 'Your adventure was updated successfully!',
                      buttons: ['OK']
                    })
                    alert.present()
                    this.navCtrl.parent.getActive().dismiss()

                  },
                    error => {
                      loading.dismiss()
                      let alert = this.alertCtrl.create({
                        title: 'REELTRAIL',
                        subTitle: 'There was an error updating your adventure, please try again later',
                        buttons: ['OK']
                      })
                      alert.present()
                    })
                }
                //new adventure
                else {
                  let loading = this.loadingCtrl.create({
                    content: 'Listing ...',
                    spinner: 'dots'
                  });

                  loading.present()

                  this.rt.listAdventure(data, listingOptions, listingDays, result.nonce,this.discount,this.tracking_id, this.voucher).then(result => {
                    loading.dismiss()
                    let alert = this.alertCtrl.create({
                      title: 'REELTRAIL',
                      subTitle: 'Your adventure was listed successfully!',
                      buttons: ['OK']
                    })
                    alert.present()
                    this.navCtrl.parent.getActive().dismiss()

                  },
                    error => {
                      loading.dismiss()
                      let alert = this.alertCtrl.create({
                        title: 'REELTRAIL',
                        subTitle: 'There was an error listing your adventure, please try again later',
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
            })
      })

    }//end pay flow
    //free flow
    else {

      //updating adventure
      if (this.oldData) {
        let loading = this.loadingCtrl.create({
          content: 'Updating ...',
          spinner: 'dots'
        });

        loading.present()

        this.rt.editAdventure(this.oldData, data, listingOptions, listingDays, "",this.discount,this.tracking_id, this.voucher).then(result => {
          loading.dismiss()
          let alert = this.alertCtrl.create({
            title: 'REELTRAIL',
            subTitle: 'Your adventure was updated successfully!',
            buttons: ['OK']
          })
          alert.present()
          this.navCtrl.parent.getActive().dismiss()

        },
          error => {
            loading.dismiss()
            let alert = this.alertCtrl.create({
              title: 'REELTRAIL',
              subTitle: 'There was an error updating your adventure, please try again later',
              buttons: ['OK']
            })
            alert.present()
          })
      }
      //new adventure
      else {
        let loading = this.loadingCtrl.create({
          content: 'Listing ...',
          spinner: 'dots'
        });

        loading.present()

        this.rt.listAdventure(data, listingOptions, listingDays, "",this.discount,this.tracking_id, this.voucher).then(result => {
          loading.dismiss()
          let alert = this.alertCtrl.create({
            title: 'REELTRAIL',
            subTitle: 'Your adventure was listed successfully!',
            buttons: ['OK']
          })
          alert.present()
          this.navCtrl.parent.getActive().dismiss()

        },
          error => {
            loading.dismiss()
            let alert = this.alertCtrl.create({
              title: 'REELTRAIL',
              subTitle: 'There was an error listing your adventure, please try again later',
              buttons: ['OK']
            })
            alert.present()
          })
      }


    } //end free flow
  }

  goBack() {
    this.navCtrl.pop();
  }
}
