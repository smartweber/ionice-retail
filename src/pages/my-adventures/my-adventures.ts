/**
 * @Author: Ruben
 * @Date:   2017-11-02T01:18:13-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-13T15:15:24-07:00
 */



import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController  } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { ItemSliding } from 'ionic-angular';
import { Events } from 'ionic-angular';
import * as _ from 'lodash'
/**
 * Generated class for the MyAdventuresPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-adventures',
  templateUrl: 'my-adventures.html',
})
export class MyAdventuresPage {

  adventures : Array<any> = [];
  nextUrl : string = null

  constructor(public alertCtrl: AlertController, public events : Events, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad MyAdventuresPage');
  }

  ionViewWillEnter(){

    this.reload()

  }

  reload(){

    this.adventures = []

    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.getMyAdventures().then(list =>{
      console.log('my adventures ', list)
      loading.dismiss()
      this.nextUrl = (list.next) ? list.next : null
      this.adventures = list.adventures
    },
    err =>{

    })
  }

  edit(item : any, slidingItem : ItemSliding){
    slidingItem.close()

    this.events.publish('open:modal', "newAdventure" , item);
  }

  delete(id:string , slidingItem : ItemSliding){
    slidingItem.close()

    let confirm = this.alertCtrl.create({
      title: 'REELTRAIL',
      message: 'Are you sure you want to delete this adventure?',
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

            this.rt.deleteAdventure(id).then(result =>{
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

  details(id) {
    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.getAdventureDetails(id).then(adventure => {

      loading.dismiss()
      this.navCtrl.push("AdventureDetailsPage", {adventure:adventure, preview:true})
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
        this.adventures = _.concat(this.adventures , list.adventures)
        this.nextUrl = (list.next) ? list.next : null
        infiniteScroll.complete();
      })
    }
    else{
      infiniteScroll.complete()
    }
  }

}
