/**
 * @Author: Ruben
 * @Date:   2017-12-05T03:00:33-07:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-13T14:50:39-07:00
 */



import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ItemSliding } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { SocialSharing } from '@ionic-native/social-sharing';
import * as _ from 'lodash';

/**
 * Generated class for the ShippingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shipping',
  templateUrl: 'shipping.html',
})
export class ShippingPage {

  soldItem: any

  item: any

  order: any

  constructor(private socialSharing: SocialSharing, public navCtrl: NavController, public navParams: NavParams, private iab: InAppBrowser, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController) {

    this.soldItem = this.navParams.get('soldItem')

    this.order = this.navParams.get('order')
    this.item = this.navParams.get('item')

  }
  share(track) {
    this.socialSharing.share(undefined, undefined, track.label_url, undefined).then(() => {
      // Success! label_url
    }).catch(() => {
      // Error!
    });
  }

  ionViewDidLoad() {

    //console.log('ionViewDidLoad ShippingPage')

  }

  ionViewWillEnter() {
    this.reload()
  }

  reload() {

    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.getShippingOrder(this.order.order_id).then(order => {
      loading.dismiss()
      this.order = order
      _.forEach(this.order.line_items, item => {
        _.forEach(item.tracking_numbers, n => {
          this.rt.shippingStatus(this.order.order_id,item._id,n.tracking,n.carrier).then(track => {
            n.status=track.tracking_status;
            n.history=track.tracking_history;
            console.log(n);
          }, e => null)
        })
      })
    },
      err => {
        loading.dismiss()
      })


  }

  addTracking() {

    this.navCtrl.push("AddTrackingPage", { order: this.order, item: this.item })
  }

  view(tracking) {

    console.log("view ", tracking)

    let url = tracking.label_url

    const browser = this.iab.create(url, '_blank');

  }

  void(tracking, slidingItem: ItemSliding) {
    slidingItem.close()

  }

  showReturnLabel(tracking, slidingItem: ItemSliding) {

    slidingItem.close()
    console.log(tracking);
    let url = tracking.return_url
    const browser = this.iab.create(url);

  }

  addShippingLabel() {

    this.navCtrl.push("ShippingLabelPage", { item: this.item, order: this.order })

  }

}
