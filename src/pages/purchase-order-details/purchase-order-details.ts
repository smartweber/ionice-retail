import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RtProvider } from '../../providers/rt/rt';
import * as moment from 'moment'
import * as _ from 'lodash';
import { SocialSharing } from '@ionic-native/social-sharing';

/**
 * Generated class for the PurchaseOrderDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-purchase-order-details',
  templateUrl: 'purchase-order-details.html',
})
export class PurchaseOrderDetailsPage {

  order: any;
  feedback: any;
  myEmail = this.rt.getUser().email
  constructor(private socialSharing: SocialSharing, public navCtrl: NavController, public navParams: NavParams, private rt: RtProvider) {
    this.order = navParams.get('order')
    _.forEach(this.order.line_items, item => {
      _.forEach(item.tracking_numbers, n => {
        this.rt.shippingStatus(this.order.order_id, item._id, n.tracking, n.carrier).then(track => {
          n.status = track.tracking_status;
          n.history = track.tracking_history;
        }, e => null)
      })
    })
    this.getFeedBack();
  }
  valueArray(v) {
    return new Array(v);
  }
  ionViewDidEnter(){
    this.getFeedBack();
  }
  getFeedBack() {
    this.rt.getFeedback(this.order.shipping_orders[0].order_id).then(res => {
      this.feedback = res.feedback;
    }, e => null)
  }
  ionViewDidLoad() {
    //console.log('ionViewDidLoad PurchaseOrderDetailsPage');
  }
  claim() {
    this.navCtrl.push("ClaimPage", { order_id: this.order.order_id, item: this.order.shipping_orders[0].line_items[0] })
  }

  parseDate(date) {
    return moment(date).format('MM/DD/YY')
  }
  share(track) {
    this.socialSharing.share(undefined, undefined, track.label_url, undefined).then(() => {
      // Success! label_url
    }).catch(() => {
      // Error!
    });
  }
  sendFeedback() {
    this.navCtrl.push("SendFeedbackPage", { feedback: this.feedback }).then(r=>{
      console.log("Done...")
      this.getFeedBack();
    })
  }
}
