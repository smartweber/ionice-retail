/**
 * @Author: Ruben
 * @Date:   2017-11-02T01:18:31-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-13T15:17:07-07:00
 */



import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { ItemSliding } from 'ionic-angular';
import { ShippingPage } from '../shipping/shipping';
import * as moment from 'moment'
/**
 * Generated class for the MyPurchasesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-purchases',
  templateUrl: 'my-purchases.html',
})
export class MyPurchasesPage {

  orders : Array<any> = [];

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider,  private rt: RtProvider, public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad MyPurchasesPage');
  }

  ionViewWillEnter(){
    this.reload()
  }

  parseDate(date){
    return moment(date).format('MM/DD/YY')
  }

  reload(){

    this.orders = []

    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()


    this.rt.getMyPurcahseOrders().then(list =>{
      loading.dismiss()
      //console.log('purchase orders ', list)
      this.orders = list.orders
    })
  }

  info(){

    let alert = this.alertCtrl.create({
      title: 'REELTRAIL',
      subTitle: 'Swipe left to view more options.',
      buttons: ['OK']
    })
    alert.present()

  }

  details(order) {
    this.navCtrl.push('PurchaseOrderDetailsPage', {order: order});
  }



  sendFeedback(purchase, slidingItem) {

  }

  goShippingDetails(purchase, slidingItem: ItemSliding) {
    console.log(purchase)
    // this.navCtrl.push('ShippingPage', {soldItem: purchase});
    slidingItem.close();
  }
}
