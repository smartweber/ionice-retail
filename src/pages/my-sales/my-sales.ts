/**
 * @Author: Ruben
 * @Date:   2017-11-02T01:18:49-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-13T15:15:37-07:00
 */



import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { ItemSliding } from 'ionic-angular';
import * as moment from 'moment'
import * as _ from 'lodash';

/**
 * Generated class for the MySalesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-sales',
  templateUrl: 'my-sales.html',
})
export class MySalesPage {

  orders : Array<any> = [];

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider,  private rt: RtProvider, public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad MySalesPage');
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

    this.rt.getMyShippingOrders().then(list =>{
      loading.dismiss()
      this.orders = list.orders      
    },
    err =>{

    })
  }

  details(order) {
    this.navCtrl.push('ShippingOrderDetailsPage', {order: order});
  }


  info(){

    let alert = this.alertCtrl.create({
      title: 'REELTRAIL',
      subTitle: 'Swipe left to view more options.',
      buttons: ['OK']
    })
    alert.present()

  }

}
