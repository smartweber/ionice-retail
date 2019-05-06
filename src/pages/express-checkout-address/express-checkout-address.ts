import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { RtProvider } from '../../providers/rt/rt';
import { Events } from 'ionic-angular';

/**
 * Generated class for the ExpressCheckoutAddressPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-express-checkout-address',
  templateUrl: 'express-checkout-address.html',
})
export class ExpressCheckoutAddressPage {


  item: any
  qty: number = 1
  aOpts: Array<any> = []
  aSOpts = {
    title: 'Choose an Address',
    subTitle: ''
  }
  addressId: string = null
  constructor(private events: Events, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private rt: RtProvider, public loadingCtrl: LoadingController, ) {
    this.qty = navParams.get("qty")
    this.item = navParams.get("item")
    this.aOpts = navParams.get("aOpts")
    this.addressId = navParams.get("addressId");
    this.events.subscribe('address:reload', (id) => {
      this.rt.getAllAddresses().then(list => {
        console.log("addreses ", list.addresses)
        this.aOpts = list.addresses
      })
    });
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad ExpressCheckoutAddressPage');
  }

  addAddress() {
    this.navCtrl.push("NewAddressPage")
  }
  checkoutPaypal() {

    if (this.addressId) {
      let loading = this.loadingCtrl.create({
        content: '',
        spinner: 'dots'
      });

      loading.present()

      this.rt.expressCheckoutPaypal(this.item._id, this.qty, this.addressId).then(sale => {
        loading.dismiss()
        console.log(sale)
        this.navCtrl.push("ExpressCheckoutPaypalPage", { sale: sale, item: this.item, qty: this.qty, shippingAddress: this.addressId })
      },
        err => {
          loading.dismiss()
          let alert = this.alertCtrl.create({
            title: 'REELTRAIL',
            subTitle: 'There was an error, please try again later',
            buttons: ['OK']
          })
          alert.present()
        })
    } else {
      let alert = this.alertCtrl.create({
        title: 'REELTRAIL',
        subTitle: 'Please select a shipping address or create one',
        buttons: ['OK']
      })
      alert.present()
    }
  }

}
