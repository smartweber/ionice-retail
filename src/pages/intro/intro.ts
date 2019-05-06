import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the IntroPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
})
export class IntroPage {

  slidesCont = [
    {
      title: "Welcome to Reeltrail",
      description: "The ultimate marketplace for outdoor enthusiats to buy and sell outdoor gear.",
      image: "assets/imgs/s1.png",
    },
    {
      title: "Browse Gear & Book Adventures",
      description: "Buy the gear you want at prices you'll love.<br/>Find your next adventure trip, guide, or instructor.",
      image: "assets/imgs/s3.png",
    },
    {
      title: "Sell Quickly & Easily",
      description: "List for free.<br/>Only pay 7.5% when your item sells.<br/>Unlimited free listings.<br/>Seller protection on all orders.",
      image: "assets/imgs/s2.png",
    },
    {
      title: "Go on, get your gear fix!",
      description: "Find the best deals, track your favorites, and never stop exploring!",
      image: "assets/imgs/s4.png",
      button:true
    }

  ];



  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad IntroPage');
  }

  dismiss(){
    this.navCtrl.parent.getActive().dismiss()
    localStorage.setItem("tutorial", "true")
  }

}
