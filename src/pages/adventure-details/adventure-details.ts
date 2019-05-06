import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams , AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { ItemSliding } from 'ionic-angular';
import moment from 'moment';
import { Events } from 'ionic-angular';
import { ImageViewerController } from "ionic-img-viewer";

declare var google;

/**
 * Generated class for the AdventureDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-adventure-details',
  templateUrl: 'adventure-details.html',
})
export class AdventureDetailsPage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;

  preview : boolean = false
  adventure : any
  userId : string = ""
  loggedIn : boolean = false
  isShownImgViewer = false;
  selectedIndex = 0;

  constructor(private events: Events, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public imageViewerCtrl: ImageViewerController) {

    this.adventure = navParams.get("adventure")
    let p = navParams.get("preview")
    this.preview = (p) ? p:false


  }


  ionViewDidLoad() {
    //console.log('ionViewDidLoad AdventureDetailsPage');
    // this.loadMap()
    // if(this.client.userData){
    //   this.userId = this.client.userData._id
    //   this.preview = this.adventure.postedByUserId._id == this.userId
    // }
  }

  ionViewWillEnter(){
    this.reload()
  }

  reload(){
    this.loadMap()
    this.loggedIn =  this.rt.isLoggedIn()
    console.log("its logged in ", this.loggedIn)

  }

  onClick(imageToView) {
    const viewer = this.imageViewerCtrl.create(imageToView);
    viewer.present();
  }

  loadMap(){

    let latLng = new google.maps.LatLng(this.adventure.location.lat,this.adventure.location.lng );

    let mapOptions = {
      center: latLng,
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

  }

  getUpdatedTime(time) {
    let diff = new Date().getTime() - new Date(time).getTime();
    if (diff / 1000 < 60) {
      return (diff / 1000).toFixed() + ' secs';
    } else if (diff / (1000 * 60) < 60 && diff / (1000 * 60) > 1) {
      return (diff / (1000 * 60)).toFixed() + ' mins';
    } else if (diff / (1000 * 60 * 60) < 24 && diff / (1000 * 60 * 60) > 1) {
      return (diff / (1000 * 60 * 60)).toFixed() + ' hrs';
    } else if (diff / (1000 * 60 * 60 * 24) < 30 && diff / (1000 * 60 * 60 * 24) > 1) {
      return (diff / (1000 * 60 * 60 * 24)).toFixed() + ' days';
    } else if (diff / (1000 * 60 * 60 * 24 * 30) > 1 && diff / (1000 * 60 * 60 * 24 * 30) < 12) {
      return (diff / (1000 * 60 * 60 * 24 * 30)).toFixed() + ' months';
    } else if (diff / (1000 * 60 * 60 * 24 * 30 * 12) > 1) {
      return (diff / (1000 * 60 * 60 * 24 * 30 * 12)).toFixed() + ' years';
    }
  }

  messsageSeller() {
    if(!this.loggedIn){
      let confirm = this.alertCtrl.create({
        title: 'REELTRAIL',
        message: 'Please login to send a message.',
        buttons: [
          {
            text: 'Cancel',
            handler: () => {
              console.log('Disagree clicked');
            }
          },
          {
            text: 'Login',
            handler: () => {
              this.events.publish('open:modal', 'login');
            }
          }
        ]
      });
      confirm.present();
    } else {
      let prompt = this.alertCtrl.create({
        title: 'Message to ' + this.adventure.postedBy.name,
        message: "Please enter a message for " +  this.adventure.postedBy.name +". You may resume the conversation under the 'Messages' section." ,
        inputs: [
          {
            name: 'message',
            placeholder: 'type your message here'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'SEND',
            handler: res => {

              this.rt.sendMessageToUser(this.adventure.postedBy._id, res.message)
            }
          }
        ]
      });
      prompt.present()
    }
  }
}
