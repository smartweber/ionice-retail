/**
 * @Author: Ruben
 * @Date:   2017-10-02T09:40:09-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-05T15:37:26-07:00
 */



import { Component, ViewChild } from '@angular/core';
import { Platform, AlertController, Nav, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { RtProvider } from '../providers/rt/rt';
import { Keyboard } from '@ionic-native/keyboard';
import { FcmProvider } from '../providers/fcm/fcm';

// import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = "TabsPage";
  @ViewChild(Nav) nav: Nav;

  title = 'Gear';
  categories = [];
  gearCategories = [
    {
      name: 'All Gear',
      icon: '002-compass.png',
      page: 'all'
    },
    {
      name: 'Featured Gear',
      icon: '001-map.png',
      page: 'featured'
    },
    {
      name: 'Fishing',
      icon: '01-all-fishing.png',
      page: 'fishing'
    },
    {
      name: 'Fly Fishing',
      icon: '11-all-fly-fishing.png',
      page: 'fly_fishing'
    },
    {
      name: 'Hunting',
      icon: '20-all-hunting.png',
      page: 'hunting'
    },
    {
      name: 'Rock & Trail',
      icon: '30-all-rock-and-trail.png',
      page: 'rock_trail'
    },
    {
      name: 'Marine',
      icon: '44-all-marine.png',
      page: 'marine'
    },
    {
      name: 'Snow',
      icon: '53-all-snow.png',
      page: 'snow'
    },
  ];

  adventureCategories = [
    {
      name: 'All Adventures',
      icon: '59-all-adventures.png',
      page: 'all'
    },
    {
      name: 'Fishing',
      icon: '01-all-fishing.png',
      page: 'fishing'
    },
    {
      name: 'Fly Fishing',
      icon: '11-all-fly-fishing.png',
      page: 'fly_fishing'
    },
    {
      name: 'Hunting',
      icon: '62-hunting.png',
      page: 'hunting'
    },
    {
      name: 'Bird Hunts',
      icon: '61-bird-hunts.png',
      page: 'wing_shooting'
    },
    {
      name: 'Snow',
      icon: '65-snow.png',
      page: 'snow'
    },
    {
      name: 'Activities',
      icon: '60-activities.png',
      page: 'activities'
    },
  ];

  constructor(
    private platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public alertCtrl: AlertController,
    private rt: RtProvider,
    private keyboard: Keyboard,
    private events: Events,
    private fcm: FcmProvider
  ) {
    this.categories = this.gearCategories

    platform.ready().then(() => {
      setTimeout(() => {
        this.rt.silentLogin()
        if (platform.is('cordova')) {
          this.fcm.getToken();
          splashScreen.hide();
          statusBar.styleLightContent()
          if (this.platform.is('android')) {
            console.log("Android detected...")
            this.keyboard.disableScroll(true);
          }
        }
      }, 100);
    });

    this.events.subscribe('select-category', (res) => {
      this.title = res === 'gear' ? 'Gear' : 'Adventures'
      this.categories = res === 'gear' ? this.gearCategories : this.adventureCategories
    });
  }

  open (category, section){
    this.events.publish('category-section', {category : category, section:section})
  }
}
