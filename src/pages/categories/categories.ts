import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, LoadingController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import * as _ from 'lodash';

declare interface Category {
    category : string
    section: string;
    title: string;
    id: string;
}

export const CATEGORIES: Category[] = [
    { category: 'gear', section: 'all',  title: 'All Gear', id: "" },
    { category: 'gear', section: 'featured',  title: 'Featured Gear', id: "" },
    { category: 'gear', section: 'marine',  title: 'Marine' , id: "5869eac79b576f0875f281c3" },
    { category: 'gear', section: 'snow',  title: 'Snow' , id: "5869eac79b576f0875f28187" },
    { category: 'gear', section: 'rock_trail',  title: 'Rock & Trail', id: "5869eac79b576f0875f2820f" },
    { category: 'gear', section: 'hunting',  title: 'Hunting', id: "5869eac79b576f0875f2824a" },
    { category: 'gear', section: 'fishing',  title: 'Fishing', id: "5869eac79b576f0875f2828e" },
    { category: 'gear', section: 'fly_fishing',  title: 'Fly Fishing', id: "5a831bfb530905153bfac00a" },

    { category: 'adventures', section: 'all',  title: 'All Adventures', id:"5869eb8b59272c0b6af516cc" },
    { category: 'adventures', section: 'featured',  title: 'Featured Adventures', id: "" },
    { category: 'adventures', section: 'activities',  title: 'Activities', id:"5869eb8b59272c0b6af516b4" },
    { category: 'adventures', section: 'wing_shooting',  title: 'Wing Shooting', id:"5869eb8b59272c0b6af516bc" },
    { category: 'adventures', section: 'hunting',  title: 'Hunting', id:"5869eb8b59272c0b6af516c2" },
    { category: 'adventures', section: 'fishing',  title: 'Fishing' , id:"5869eb8b59272c0b6af516c7"},
    { category: 'adventures', section: 'fly_fishing',  title: 'Fly Fishing', id:"5869eb8b59272c0b6af516cb" },
    { category: 'adventures', section: 'snow',  title: 'Snow' , id: "5869eac79b576f0875f28187" },
];

@IonicPage({
  priority: 'high'
})
@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html',
})
export class CategoriesPage {

  category: string = "gear";
  counter : number = 0
  itsapp : boolean = true;
  listings : Array<any> = []
  adventures : Array<any> = []
  sec :string = "all"
  nextUrl : string = null

  constructor(public navCtrl: NavController, public navParams: NavParams, private rt: RtProvider, public events: Events,  private client: ClientProvider, public platform : Platform, private iab: InAppBrowser, public loadingCtrl: LoadingController) {
    this.events.subscribe('category-section', (res) => {
      this.sec = res.section
      this.reload()
    });
  }

  ionViewDidLoad() {
    if(this.platform.is('cordova')){
      this.itsapp = false;
    }
    this.subscribeToEvents()
    this.reload()
  }
  features() {
    this.navCtrl.push('AboutHowItWorksPage');
  }

  ionViewWillUnload(){
    this.unsubscribeToEvents()
  }

  ionViewDidEnter(){
    this.counter = this.client.counters.cart

    let tutorial = localStorage.getItem("tutorial")

    if(tutorial == null){
      this.events.publish('open:modal', 'tutorial')
    }
  }

  openCart(){
    this.events.publish('open:modal', 'cart')
  }

  open (category, section){
    if(category == "gear"){
      this.navCtrl.push("GearListingsPage", {category : category, section:section})
    }
    else{
      this.navCtrl.push("AdventureListingsPage", {category : category, section:section})
    }
  }

  subscribeToEvents(){
    this.events.subscribe('update:counters', (counters) => {
      this.counter = counters.cart
    })
  }

  unsubscribeToEvents() {
    var res1 = this.events.unsubscribe('update:counters')
  }

  removethis(){
    this.itsapp = false;
  }

  getApps(){
    if(navigator.userAgent.match(/iPad/i)){
      const browser = this.iab.create('https://itunes.apple.com/us/app/reeltrail/id1244995948?mt=8&ign-mpt=uo%3D2');
     }

     if(navigator.userAgent.match(/iPhone/i)){
      const browser = this.iab.create('https://itunes.apple.com/us/app/reeltrail/id1244995948?mt=8&ign-mpt=uo%3D2');
     }

     if(navigator.userAgent.match(/Android/i)){
      const browser = this.iab.create('https://play.google.com/store/apps/details?id=com.reeltrail.rtmobile');
     }
  }

  changeCategory() {
    this.sec = 'all';
    this.events.publish('select-category', this.category)
    this.reload()
  }

  view(item) {
    let loading = this.loadingCtrl.create({
      content: '',
      spinner: 'dots'
    })
    loading.present()

    let id = (item.id != undefined) ? item.id : item._id
    if (this.category === 'gear') {
      let preview = this.rt.getUser()._id == item.postedBy._id
      this.rt.getGearDetails(id).then(gear => {
        loading.dismiss()
        this.navCtrl.push("ItemDetailsPage", {item:gear, preview : preview})
      },
      err =>{
        loading.dismiss()
      })
    } else {
      let preview = this.rt.getUser()._id == item.postedBy
      this.rt.getAdventureDetails(id).then(adventure => {
        loading.dismiss()
        this.navCtrl.push("AdventureDetailsPage", {adventure:adventure, preview : preview})
      },
      err =>{
        loading.dismiss()
      })
    }
  }

  loadMore(infiniteScroll){
    if(this.nextUrl){
      this.rt.loadNextUrl(this.nextUrl).then(list => {
        if (this.category === 'gear') {
          this.listings = _.concat(this.listings , list.gear)
        } else {
          this.adventures = _.concat(this.adventures , list.adventures)
        }
        this.nextUrl = (list.next) ? list.next : null
        infiniteScroll.complete();
      })
    }
    else{
      infiniteScroll.complete()
    }
  }

  reload(){
    this.counter = this.client.counters.cart
    let loading = this.loadingCtrl.create({
      content: 'Loading.',
      spinner : 'dots'
    })
    loading.present()

    if (this.category === 'gear') {
      this.listings = []

      let obj = _.find( CATEGORIES , {category: this.category , section:this.sec})
  
      if(this.sec == 'all'){
        this.rt.getGear().then(list => {
          loading.dismiss()
          this.nextUrl = (list.next) ? list.next : null
          this.listings = list.gear
        },
        err =>{
          loading.dismiss()
        })
      }
      else if(this.sec == 'featured'){
        this.rt.getFeaturedGear().then(list => {
          loading.dismiss()
          this.listings = list
  
          this.listings.map(l => {
            this.rt.getGearDetails(l.id ? l.id : l._id).then(gear => {
              l.postedBy = gear.postedBy;
              return l;
            },
            err =>{
            })
          });
        },
        err =>{
          loading.dismiss()
        })
      }
      else{
        this.rt.getGear(obj.id).then(list => {
          loading.dismiss()
          this.listings = list.gear
          this.nextUrl = (list.next) ? list.next : null
        },
        err =>{
          loading.dismiss()
        })
      }
    } else {
      this.adventures = []

      let cat = _.find( CATEGORIES , {category: this.category , section:"all"})
      let subCat = _.find( CATEGORIES , {category: this.category , section:this.sec})
  
      if(this.sec == 'all'){
        this.rt.getAdventures().then(list => {
          loading.dismiss()
          this.adventures = list.adventures
          this.nextUrl = (list.next) ? list.next : null
        },
        err =>{
          loading.dismiss()
        })
      } else {
        this.rt.getAdventures(cat.id,subCat.id).then(list => {
          loading.dismiss()
          this.adventures = list.adventures
          this.nextUrl = (list.next) ? list.next : null
        },
        err =>{
          loading.dismiss()
        })
      }
    }
  }
}
