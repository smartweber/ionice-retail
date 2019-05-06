/**
 * @Author: Ruben
 * @Date:   2017-10-26T02:38:32-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-06T14:57:06-07:00
 */



import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Events } from 'ionic-angular';
import { CATEGORIES } from '../categories/categories';
import _ from 'lodash';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';

/**
 * Generated class for the GearListingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-gear-listings',
  templateUrl: 'gear-listings.html',
})
export class GearListingsPage {

  title: string = ""
  listings: Array<any> = []
  counter: number = 0
  cat: string = ""
  sec: string = ""
  nextUrl: string = null

  constructor(public events: Events, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController) {
    this.sec = this.navParams.get("section")
    this.cat = this.navParams.get("category")
    this.title = this.navParams.get("title")
    console.log("opening ", this.sec, this.cat);
  }

  ionViewWillEnter() {

  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad GearListingsPage');
    this.reload();
  }

  reload() {

    this.counter = this.client.counters.cart
    this.listings = []
    if (this.cat) {
      this.cat = this.cat.replace(/-/g, "_");
    }

    let obj = _.find(CATEGORIES, { category: this.cat, section: this.sec })
    if (obj && obj.title) {
      this.title = obj.title
    }
    if (this.sec == 'all') {
      let loading = this.loadingCtrl.create({
        content: 'Loading.',
        spinner: 'dots'
      })
      loading.present()

      this.rt.getGear().then(list => {
        loading.dismiss()
        this.nextUrl = (list.next) ? list.next : null
        this.listings = list.gear


      },
        err => {
          loading.dismiss()

        })

      // this.client.getAllListings(0,100,null).then((res) => {
      //   loading.dismiss()
      //   console.log(res)
      //   if(res.err){
      //
      //   }
      //   else{
      //     this.listings = res.data.docs
      //
      //     _.forEach(this.listings, function(item, key){
      //         item.ourPrice = item.ourPrice*100
      //         item.originalPrice = item.originalPrice*100
      //         item.flatShippingRate = item.flatShippingRate*100
      //     })
      //   }
      // })
    }
    else if (this.sec == 'featured') {

      let loading = this.loadingCtrl.create({
        content: 'Loading.',
        spinner: 'dots'
      })
      loading.present()

      this.rt.getFeaturedGear().then(list => {
        loading.dismiss()
        this.listings = list

        this.listings.map(l => {
          this.rt.getGearDetails(l.id ? l.id : l._id).then(gear => {
            l.postedBy = gear.postedBy;
            return l;
          },
            err => {
            })
        });
      },
        err => {
          loading.dismiss()

        })

    }
    else {
      let loading = this.loadingCtrl.create({
        content: 'Loading.',
        spinner: 'dots'
      })
      loading.present()

      this.rt.getGear(obj ? obj.id:this.sec ).then(list => {
        loading.dismiss()
        this.listings = list.gear
        this.nextUrl = (list.next) ? list.next : null
      },
        err => {
          loading.dismiss()

        })

      // this.client.getListingsByCategoryFilter({mainCategoryId:obj.id, subCategoryId:"", subSubCategoryId:""}).then(list =>{
      //     this.listings = list
      // })
    }
  }

  openCart() {
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
      this.navCtrl.push("ItemDetailsPage", { item: gear, preview: preview })
    },
      err => {
        loading.dismiss()
      })

  }

  loadMore(infiniteScroll) {

    if (this.nextUrl) {
      this.rt.loadNextUrl(this.nextUrl).then(list => {
        this.listings = _.concat(this.listings, list.gear)
        this.nextUrl = (list.next) ? list.next : null
        infiniteScroll.complete();
      })
    }
    else {
      infiniteScroll.complete()
    }
  }

}
