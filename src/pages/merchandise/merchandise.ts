
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController , Events} from 'ionic-angular';
import {CATEGORIES} from '../categories/categories';
import _ from 'lodash';
import {ClientProvider} from '../../providers/client/client';
import {RtProvider} from '../../providers/rt/rt';
/**
 * Generated class for the MerchandisePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-merchandise',
  templateUrl: 'merchandise.html',
})
export class MerchandisePage {

  title : string = ""
  listings : Array<any> = []
  counter : number = 0
  cat :string = ""
  sec :string = ""
  nextUrl : string = null

  constructor(public events: Events, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController) {
    this.sec = this.navParams.get("section")
    this.cat = this.navParams.get("category")
    console.log("opening ", this.sec , this.cat)
  }

  ionViewWillEnter(){
    
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad MerchandiseListingsPage');
    this.reload();
  }

  reload(){

    this.counter = this.client.counters.cart
    this.listings = []
    this.title = "Merchandise";

    if(this.sec == 'all'){
      let loading = this.loadingCtrl.create({
        content: 'Loading.',
        spinner : 'dots'
      })
      loading.present()

      this.rt.getMerchandise().then(list => {
        loading.dismiss()
        this.nextUrl = (list.next) ? list.next : null
        this.listings = list.gear


      },
      err =>{
        loading.dismiss()

      })
    }
  }

  openCart(){
    this.events.publish('open:modal', 'cart')
  }

  view(item) {

    let loading = this.loadingCtrl.create({
      content: '',
      spinner: 'dots'
    })
    loading.present()

    let id = (item.id != undefined) ? item.id : item._id

    let preview = this.rt.getUser()._id == item.postedBy._id

    this.rt.getGearDetails(id).then(gear => {
      loading.dismiss()
      this.navCtrl.push("ItemDetailsPage", {item:gear, preview : preview})
    },
    err =>{
      loading.dismiss()
    })

  }

  loadMore(infiniteScroll){

    if(this.nextUrl){
      this.rt.loadNextUrl(this.nextUrl).then(list => {
        this.listings = _.concat(this.listings , list.gear)
        this.nextUrl = (list.next) ? list.next : null
        infiniteScroll.complete();
      })
    }
    else{
      infiniteScroll.complete()
    }
  }

}
