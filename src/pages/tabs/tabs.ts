/**
 * @Author: Ruben
 * @Date:   2017-10-02T09:40:09-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-12T02:50:45-07:00
 */



import { Component, ViewChild } from '@angular/core';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { Keyboard, Platform } from 'ionic-angular';
import { IonicPage, Events, Tabs, ModalController, NavController, AlertController } from 'ionic-angular';
import { ModalNavigationComponent } from '../../components/modal-navigation/modal-navigation';


@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {

  @ViewChild("mainTabs") mainTabs: Tabs;

  // tab1Root = "LoginPage";
  tab1Root = "CategoriesPage"
  tab2Root = "SearchPage"
  tab3Root = "SellPage"
  tab4Root = "MessagesPage"
  tab5Root = "ProfilePage"



  constructor(public alertCtrl: AlertController, public navCtrl: NavController, private client: ClientProvider, private rt: RtProvider, public events: Events, public modalCtrl: ModalController, private keyboard: Keyboard, private platform: Platform) {

    this.subscribeToEvents()
    // this.updateTabs()
  }

  updateTabs() {

    console.log("Updating Tabs ", this.client.isUserLoggedIn, this.client.isUserConfirmed)
    if (this.client.isUserLoggedIn && this.client.isUserConfirmed) {



      this.tab4Root = "MessagesPage"
      this.tab5Root = "ProfilePage"

      this.mainTabs.select(0)


    }
    else if (this.client.isUserLoggedIn) {
      this.tab4Root = "PleaseLoginPage"
      this.tab5Root = "PleaseLoginPage"
    }
    else {
      this.tab4Root = "PleaseLoginPage"
      this.tab5Root = "PleaseLoginPage"
    }
  }

  isKeyboardOpen() {
    return this.keyboard.isOpen() && (!this.platform.is('core') && !this.platform.is('mobileweb'));
  }

  subscribeToEvents() {
    //TABS Events
    this.events.subscribe('tab:select', (tabName) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      console.log('----Tab selected ', tabName);

      switch (tabName) {
        case 'categories':
          this.mainTabs.select(0);
          break
        case 'search':
          this.mainTabs.select(1);
          break
        case 'sell':
          this.mainTabs.select(2);
          break
        case 'messages':
          this.mainTabs.select(3);
          break
        case 'profile':
          this.mainTabs.select(4);
          break
      }
    })

    //MODAL Pages Events
    this.events.subscribe('open:modal', (name, data) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      var modal
      switch (name) {

        case 'chat':
          modal = this.modalCtrl.create(ModalNavigationComponent, { root: "ChatPage", data: data })
          modal.present()
          break

        case 'login':
          modal = this.modalCtrl.create(ModalNavigationComponent, { root: "LoginPage" })
          modal.present()
          break

        case 'signup':
          modal = this.modalCtrl.create(ModalNavigationComponent, { root: "RegisterPage" })
          modal.present()
          break

        case 'newGear':

          this.canPostGear().then(canPost => {
            if (canPost) {

              if (data == undefined)
                data = null
              this.clearCache()
              modal = this.modalCtrl.create(ModalNavigationComponent, { root: "NewItemStep1Page", data: data })
              modal.present();
              modal.onDidDismiss(res => {
                this.client.btnClickCount.next(0);
              });
            }
          })

          break

        case 'newAdventure':
          if (this.canPost()) {
            this.clearCache()
            if (data == undefined)
              data = null
            console.log("DATA == ", data)
            modal = this.modalCtrl.create(ModalNavigationComponent, { root: "NewAdvStep1Page", data: data })
            modal.present();
            modal.onDidDismiss(res => {
              this.client.btnClickCount.next(0);
            });
          }
          break

        case 'cart':
          if (this.canAdd()) {
            modal = this.modalCtrl.create(ModalNavigationComponent, { root: "CartPage" })
            modal.present()
          }
          break

        case 'tutorial':

          modal = this.modalCtrl.create(ModalNavigationComponent, { root: "IntroPage" })
          modal.present()

          break
      }



    })




    //Auth Events
    this.events.subscribe('auth:event', (event) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      console.log('----User Logged In ', event);

      switch (event) {
        case 'loggedIn':
          // this.updateTabs()
          this.mainTabs.select(0)
          break
        case 'loggedOut':
          this.mainTabs.select(0)
          // this.updateTabs()
          break
      }
    })

  }

  clearCache() {

    localStorage.removeItem('step1')
    localStorage.removeItem('step2')
    localStorage.removeItem('step3')
  }

  canPostGear(): Promise<boolean> {

    return new Promise((resolve, reject) => {

      resolve(true)

    })

  }

  canPost() {

    return true
  }

  canAdd() {
    let loggedIn = this.rt.isLoggedIn()


    if (!loggedIn) {

      let confirm = this.alertCtrl.create({
        title: 'REELTRAIL',
        message: 'Please login to access your cart.',
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
      return false
    }
    else {

      return true

    }

  }

  openModal(page) {
    let modal = this.modalCtrl.create(page)
    modal.onDidDismiss(data => {

    })
    modal.present();
  }
}
