import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import {CATEGORIES} from '../categories/categories';
import _ from 'lodash';
import {ClientProvider} from '../../providers/client/client';
import {RtProvider} from '../../providers/rt/rt';

/**
 * Generated class for the AdventureListingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-adventure-listings',
  templateUrl: 'adventure-listings.html',
})
export class AdventureListingsPage {

  title : string = ""
  adventures : Array<any> = []

  cat :string = ""
  sec :string = ""

  nextUrl : string = null

  constructor(public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider,  private rt: RtProvider, public loadingCtrl: LoadingController) {

    this.sec = this.navParams.get("section")
    this.cat = this.navParams.get("category")
    this.title = this.navParams.get("title")
  }

  ionViewDidLoad() {
    this.reload();
  }

  reload(){

    this.adventures = []

    let cat = _.find( CATEGORIES , {category: this.cat , section:"all"})
    let subCat = _.find( CATEGORIES , {category: this.cat , section:this.sec})
    if (subCat && subCat.title) {
      this.title = subCat.title
    }

    if(this.sec == 'all' || this.sec == 'featured'){
      let loading = this.loadingCtrl.create({
        content: 'Loading.',
        spinner : 'dots'
      })
      loading.present()

      this.rt.getAdventures().then(list => {
        loading.dismiss()
        this.adventures = list.adventures
        this.nextUrl = (list.next) ? list.next : null
      },
      err =>{
        loading.dismiss()

      })
    }

    else{
      let loading = this.loadingCtrl.create({
        content: 'Loading.',
        spinner : 'dots'
      })
      loading.present()

      this.rt.getAdventures((cat.id,subCat ? subCat.id:this.sec)).then(list => {
        loading.dismiss() 
        this.adventures = list.adventures
        this.nextUrl = (list.next) ? list.next : null
      },
      err =>{
        loading.dismiss()

      })

      // this.client.getListingsByCategoryFilter({mainCategoryId:obj.id, subCategoryId:"", subSubCategoryId:""}).then(list =>{
      //     this.listings = list
      // })
    }

  }

  view(adventure) {

    let loading = this.loadingCtrl.create({
      content: '',
      spinner: 'dots'
    })
    loading.present()

    let id = adventure._id

    let preview = this.rt.getUser()._id == adventure.postedBy

    this.rt.getAdventureDetails(id).then(adventure => {
      console.log(adventure)
      loading.dismiss()
      this.navCtrl.push("AdventureDetailsPage", {adventure:adventure, preview : preview})
    },
    err =>{
      loading.dismiss()
    })

  }

  loadMore(infiniteScroll){

    console.log('load more ', infiniteScroll)

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
