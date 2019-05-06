import { Component, Renderer, ViewChild } from '@angular/core';
import { Platform, IonicPage, NavController, NavParams, LoadingController, Searchbar } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { Events } from 'ionic-angular';
import * as _ from 'lodash'
import { Keyboard } from '@ionic-native/keyboard';

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  icons = {
    'fishing': '01-all-fishing.png',
    "clothing-accessories": "02-clothing-and-headgear.png",
    "fishing-boats": "03-boats.png",
    "bowfishing": "04-bowfishing.png",
    "terminal-tackle": "05-terminal-tackle.png",
    "lures": "06-lures.png",
    "accessories": "07-accessories.png",
    "rod-reel-combos": "08-rod-and-reel-combos.png",
    "fishing-rods": "09-rods.png",
    "fishing-reels": "10-reels.png",
    "fly-fishing": "11-all-fly-fishing.png",
    "fly-rods": "12-fly-rods.png",
    "fly-reels": "13-fly-reels.png",
    "flies": "14-flies.png",
    "fly-tying-material": "15-fly-tying-material.png",
    "line,-leaders,-&-tippets": "16-line-leader-&-tippets.png",
    "fly-outfits": "17-fly-outfits.png",
    "waders-&-boots": "19-waders-and-boots.png",
    "hunting": "20-all-hunting.png",
    "clothing": "21-clothing.png",
    "stands-&-blinds": "22-stands-and-blinds.png",
    "treestands": "23-treestands.png",
    "decoys": "24-decoys.png",
    "game-calls": "25-game-calls.png",
    "optics-scopes": "26-optics-and-scopes.png",
    "hunting-accessories": "27-hunting-accessories.png",
    "archery": "28-archery.png",
    "electronics": "29-electronics.png",
    "rock-trail": "30-all-rock-and-trail.png",
    "hiking-clothes": "32-hiking-cloths.png",
    "lighting": "33-lighting.png",
    "hammocks-pads": "34-hammocks-and-pads.png",
    "camping-furniture": "35-camping-furniture.png",
    "healthy-safety": "36-health-and-safety.png",
    "cooking-accessories": "38-cooking-accessories.png",
    "gadgets-gear": "39-gadget-and-gear.png",
    "sleeping-bags": "40-sleeping-bags.png",
    "backpacks": "41-backpacks.png",
    "tents": "42-tents.png",
    "rock-cimbing": "43-rock-climbing.png",
    "marine": "44-all-marine.png",
    "trailer-accessories": "45-trailer-parts.png",
    "marine-hardware-accessories": "46-marine-hardware.png",
    "marine-electronics": "47-electronics.png",
    "trolling-motors": "48-trolling-motors.png",
    "sailing": "50-sailing.png",
    "water-sports": "51-water-sports.png",
    "kayaks-canoes": "52-kayaks-and--canoes.png",
    "snow": "53-all-snow.png",
    "travel-accessories": "54-travel-accessories.png",
    "avalanche-safety-gear": "56-avalanche-safety-gear.png",
    "skiing": "57-skiing.png",
    "snowboarding": "58-snowboarding.png",
    "adventures": "all-adventures.png",
    "activities": "60-activities.png",
    "bird-hunts": "61-bird-hunts.png",
  };

  results: Array<any>;
  loading: boolean = false
  counter: number = 0

  nextUrl: string = null

  mainCat: Array<any> = []
  subCat: Array<any> = []
  subSubCat: Array<any> = []
  public rand: number = 0;
  @ViewChild('searchBar') searchBar: Searchbar;

  constructor(private renderer: Renderer, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController, public events: Events,
    private keyboard: Keyboard, private platform: Platform, ) {
    this.getCategories();
  }

  openCart() {
    this.events.publish('open:modal', 'cart')
  }


  ionViewDidLoad() {
    //console.log('ionViewDidLoad SearchPage');
    this.rand = Math.floor(Math.random() * this.mainCat.length);
  }

  ionViewDidEnter() {
    // setTimeout(()=>{
    //   this.searchBar.setFocus()
    // })

  }

  onSearch(event) {
    this.closeKeyboard()
  }

  closeKeyboard() {
    if (this.platform.is('android')) {
      console.log("Serach on android detected...")
      this.renderer.invokeElementMethod(event.target, 'blur');
        this.keyboard.close()
    }
  }

  getItems(ev: any) {


    let val = ev.target.value
    console.log(val)

    let filterListing = {
      term: val,
      start: 0,
      rows: 100,
      type: "Listing",
      categories: ["", "", ""]
    }

    let filterAdventure = {
      term: val,
      start: 0,
      rows: 100,
      type: "Adventure",
      categories: ["", "", ""]
    }

    this.loading = true


    this.rt.searchGear(val).then((result) => {
      this.loading = false

      this.results = result.gear
      this.nextUrl = (result.next) ? result.next : null

    },
      err => {

      })

  }

  onCancel($event) {
    this.results = []
  }

  view(item) {

    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()

    let preview = this.rt.getUser()._id == item.postedBy

    this.rt.getGearDetails(item._id).then(gear => {

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
        this.results = _.concat(this.results, list.gear)
        this.nextUrl = (list.next) ? list.next : null
        infiniteScroll.complete();
      })
    }
    else {
      infiniteScroll.complete()
    }
  }

  getCategories() {
    this.rt.getCategories().then(res => {
      this.rand = Math.floor(Math.random() * res.length);
      this.mainCat = res;
    }, err => null);
  }

  get sub() {
    if (!this.mainCat || this.mainCat.length == 0) {
      return [];
    }
    return this.mainCat[this.rand].subcategories;
  }
  open (category, section,title?:string){
    if(category == "gear"){
      this.navCtrl.push("GearListingsPage", {category : category, section:section,title:title})
    }
    else{
      this.navCtrl.push("AdventureListingsPage", {category : category, section:section,title:title})
    }
  }

  filter(item) {
    if (this.mainCat[this.rand].name == 'Adventure') {
      this.rt.getAdventures(this.mainCat[this.rand]._id, item._id).then((result) => {
        this.loading = false
        this.results = result.gear
        this.nextUrl = (result.next) ? result.next : null
        //do another random list
        this.rand = Math.floor(Math.random() * this.mainCat.length);
      },
        err => {

        })
    } else {
      this.rt.getGear(this.mainCat[this.rand]._id, item._id).then((result) => {
        this.loading = false
        this.results = result.gear
        this.nextUrl = (result.next) ? result.next : null
        //do another random list
        this.rand = Math.floor(Math.random() * this.mainCat.length);
      },
        err => {

        })
    }
  }

  features() {
    this.navCtrl.push('AboutHowItWorksPage');
  }
}
