import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RtProvider } from '../../providers/rt/rt';
import * as moment from 'moment'
import { SocialSharing } from '@ionic-native/social-sharing';
import * as _ from 'lodash';


/**
 * Generated class for the ShippingOrderDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shipping-order-details',
  templateUrl: 'shipping-order-details.html',
})
export class ShippingOrderDetailsPage {

  order: any;
  feedback: any;
  myEmail = this.rt.getUser().email;
  constructor(private rt:RtProvider,private socialSharing: SocialSharing,public navCtrl: NavController, public navParams: NavParams) {

    this.order = navParams.get('order')
    _.forEach(this.order.line_items, item => {
      _.forEach(item.tracking_numbers, n => {
        this.rt.shippingStatus(this.order.order_id,item._id,n.tracking,n.carrier).then(track => {
          n.status=track.tracking_status;
          n.history=track.tracking_history;
        }, e => null)
      })
    })
    this.getFeedBack();
  }
  valueArray(v) {
    return new Array(v);
  }
  getFeedBack(){
    this.rt.getFeedback(this.order.order_id).then(res => {
      this.feedback = res.feedback;
    }, e => null)
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad ShippingOrderDetailsPage');
  }

  parseDate(date) {
    return moment(date).format('MM/DD/YY')
  }

  getSubscriptionName(name: string) {
    let flc = name.charAt(0).toUpperCase()
    let wfl = name.slice(1)
    return flc + wfl
  }

  shippingDetails(order, item, slidingItem) {
    if (slidingItem && slidingItem.close !==undefined && typeof slidingItem.close ==='function') {
      slidingItem.close()
    }
    this.navCtrl.push("ShippingPage", { order: order, item: item })
  }
  share(track){
    this.socialSharing.share(undefined,undefined,track.label_url,undefined).then(() => {
      // Success! label_url
    }).catch(() => {
      // Error!
    });
  }
  ionViewDidEnter(){
    this.getFeedBack();
  }

  sendFeedback(){
    this.navCtrl.push("SendFeedbackPage",{feedback:this.feedback}).then(r=>{
      this.getFeedBack();
    })
  }

}
