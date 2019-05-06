import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , LoadingController} from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import * as moment from 'moment';
import { ItemSliding } from 'ionic-angular';
import { Events } from 'ionic-angular';

/**
 * Generated class for the NotificationsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {

  notifications : Array<any> = [];

  constructor(private events: Events, public navCtrl: NavController, public navParams: NavParams, private client : ClientProvider, private rt : RtProvider, public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad NotificationsPage');

    this.events.subscribe('notification:event', ()=>{
      this.reload()
    })
  }

  ionViewWillEnter(){
      this.reload()
  }

  reload(){



    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.getNotifications().then(list =>{
      loading.dismiss()
      this.notifications = list.notifications
    },
    err =>{
      loading.dismiss()
    })

  }

  clear(notification, slidingItem : ItemSliding) {
    slidingItem.close()
    let loading = this.loadingCtrl.create({
      content: 'Deleting ...',
      spinner: 'dots'
    });

    loading.present()
    this.rt.clearNotifications(notification._id).then(result =>{

      loading.dismiss()
      this.reload()

    },
    err =>{
      loading.dismiss()
    })
  }

  formatDate(date){
    return moment(date).format('MMMM D, YYYY')
  }

  open(notification) {
    console.log('opening ', notification)


    switch(notification.type){
      case 'offer' :
          this.navCtrl.push('OffersPage')
      break;

      case 'sale' :
        this.navCtrl.push('MySalesPage')
      break

      case 'purchase' :
        this.navCtrl.push('MyPurchasesPage')
      break

      case 'feedback' :
        this.navCtrl.push('FeedbackPage')
      break
    }
  }


}
