import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , LoadingController} from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
/**
 * Generated class for the OffersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-offers',
  templateUrl: 'offers.html',
})
export class OffersPage {

  received : Array<any> =[]
  sent : Array<any> =[]

  type : string = 'received'

  constructor(public navCtrl: NavController, public navParams: NavParams, private client : ClientProvider, private rt : RtProvider, public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad OffersPage');
  }

  ionViewWillEnter (){
    this.reload()
  }

  reviewed(offer){
    return typeof offer.accepted !== 'undefined'
  }

  reload(){

    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.getOffersReceived().then(list =>{

      this.received=list.offers
      console.log('received ', this.received)
    },
    err =>{

    })

    this.rt.getOffersSent().then(list =>{
      loading.dismiss()
      this.sent=list.offers
      console.log('sent ', this.sent)
    },
    err =>{
      loading.dismiss()
    })
  }

  acceptOffer(offer) {

    let loading = this.loadingCtrl.create({
      content: 'Accepting offer ...',
      spinner: 'dots'
    });

    loading.present()


    this.rt.acceptOffer(offer._id).then(res =>{
      loading.dismiss()
      this.reload()
    },
    err =>{
      loading.dismiss()
    })

  }

  rejectOffer (offer) {
    let loading = this.loadingCtrl.create({
      content: 'Rejecting offer ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.rejectOffer(offer._id).then(res =>{
      loading.dismiss()
      this.reload()
    },
    err =>{
      loading.dismiss()
    })
  }

}
