/**
 * @Author: Ruben
 * @Date:   2017-11-02T01:18:02-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-13T15:15:18-07:00
 */



import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { ItemSliding } from 'ionic-angular';
import { Events } from 'ionic-angular';
import * as _ from 'lodash'



@IonicPage()
@Component({
  selector: 'page-my-items',
  templateUrl: 'my-items.html',
})
export class MyItemsPage {

  items : Array<any> = [];
  nextUrl : string = null

  constructor(public alertCtrl: AlertController, public events : Events,  public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad MyItemsPage');
  }

  ionViewWillEnter(){

    this.reload()

  }

  details(id) {
    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.getGearDetails(id).then(gear => {

      loading.dismiss()
      this.navCtrl.push("ItemDetailsPage", {item:gear, preview:true})
    },
    err =>{
      loading.dismiss()
    })

    // this.client.getListingItem(id).then((item) => {
    //     loading.dismiss()
    //     console.log(item)
    //     this.navCtrl.push("ItemDetailsPage", {item:item, preview:true})
    //
    // })
  }

  reload(){

    this.items = []

    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.getMyGear().then(list =>{
      console.log('my gear ', list)
      loading.dismiss()
      this.items = list.gear
      this.nextUrl = (list.next) ? list.next : null
    },
    err =>{

    })
  }

  edit(gear, slidingItem : ItemSliding){

    slidingItem.close()
    this.events.publish('open:modal', "newGear" , gear)

  }

  delete(id:string , slidingItem : ItemSliding){
    slidingItem.close()

    let confirm = this.alertCtrl.create({
      title: 'REELTRAIL',
      message: 'Are you sure you want to delete this item?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {

            this.rt.deleteGear(id).then(result =>{
              let loading = this.loadingCtrl.create({
                content: 'Deleting ...',
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
    })
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

  loadMore(infiniteScroll){

    console.log('load more ', infiniteScroll)
    console.log('load more from ', this.nextUrl)

    if(this.nextUrl){
      this.rt.loadNextUrl(this.nextUrl).then(list => {
        this.items = _.concat(this.items , list.gear)
        this.nextUrl = (list.next) ? list.next : null
        infiniteScroll.complete();
      })
    }
    else{
      infiniteScroll.complete()
    }
  }

}
