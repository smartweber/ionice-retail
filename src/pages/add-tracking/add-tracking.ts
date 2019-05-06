/**
 * @Author: Ruben
 * @Date:   2017-12-05T03:41:10-07:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-05T04:18:33-07:00
 */



import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';

/**
 * Generated class for the AddTrackingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-tracking',
  templateUrl: 'add-tracking.html',
})
export class AddTrackingPage {

  carriers = [{ value: "fedex", name: "FedEx" }, { value: "usps", name: "USPS" }, { value: "ups", name: "UPS" }]


  public form = this.fb.group({
    tracking_number: ['', Validators.required],
    carrier: ['', Validators.required]
  });

  carrierOpt = {
    title: 'Carrier',
    subTitle: 'Please select your carrier '
  }

  order: any
  item: any


  constructor(public fb: FormBuilder, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {

    this.order = navParams.get('order')
    this.item = navParams.get('item')
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad AddTrackingPage');
  }

  add(form) {

    let loading = this.loadingCtrl.create({
      content: '',
      spinner: 'dots'
    })
    loading.present()

    this.rt.addTracking(this.order.order_id, this.item._id, form.tracking_number, form.carrier).then(result => {

      if (!result.address_from && !result.address_to) {
        let alert = this.alertCtrl.create({
          title: 'REELTRAIL',
          subTitle: 'There was a problem validating the tracking number you provided, please verify and tray again',
          buttons: ['OK']
        })
        alert.present()
      } else {
        loading.dismiss()
        console.log(result);
        this.navCtrl.pop()
      }
    },() => {

        let alert = this.alertCtrl.create({
          title: 'REELTRAIL',
          subTitle: 'There was a problem validating the tracking number you provided, please verify and tray again',
          buttons: ['OK']
        })
        alert.present()
      })


  }

}
