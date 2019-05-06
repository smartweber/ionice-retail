/**
 * @Author: Ruben
 * @Date:   2017-11-02T01:17:46-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-13T15:15:02-07:00
 */



import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , AlertController, LoadingController} from 'ionic-angular';
import { RtProvider } from '../../providers/rt/rt';
import { ItemSliding } from 'ionic-angular';

/**
 * Generated class for the WatchListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-watch-list',
  templateUrl: 'watch-list.html',
})
export class WatchListPage {

  items : Array<any> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private rt : RtProvider,  public loadingCtrl: LoadingController, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad WatchListPage');
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

    this.rt.getWatchList().then(list => {
      loading.dismiss()
      this.items = list.watching
    },
    err =>{

    })

  }

  unwatch(item : any, slidingItem: ItemSliding){

    slidingItem.close()

    let confirm = this.alertCtrl.create({
      title: 'REELTRAIL',
      message: 'Are you sure you want to unwatch this item?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Unwatch',
          handler: () => {
            console.log('unwatching ', item._id)
            this.rt.unWatchGear(item._id).then(result =>{
              let loading = this.loadingCtrl.create({
                content: 'Unwatching ...',
                spinner: 'dots'
              });

              loading.present()

              setTimeout(()=>{
                loading.dismiss()
                this.reload()
              },1000)
            },
            err =>{

            })

          }
        }
      ]
    });
    confirm.present()


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
