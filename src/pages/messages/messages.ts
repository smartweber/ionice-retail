import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import * as moment from 'moment';
/**
 * Generated class for the MessagesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {

  loggedIn: boolean = false
  confirmed: boolean = false
  messages: Array<any> = []
  myId: string = ""
  counter: number = 0
  currentLoading: any

  conversations: Array<any> = []


  constructor(public navCtrl: NavController, public navParams: NavParams, public events: Events, private client: ClientProvider, private rt: RtProvider, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {

  }
  deleteChat(conversation: any) {
    let confirm = this.alertCtrl.create({
      title: 'REELTRAIL',
      message: 'Are you sure you want to delete this conversation?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            this.rt.socket.emit('delete_conversation', conversation._id);
            this.events.publish('chat:delete_conversation', conversation._id);

          }
        }
      ]
    })
    confirm.present()
  }

  subscribeToEvents() {
    this.events.subscribe('auth:event', (event) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      console.log('profile Page ----User Logged In ', event);

      switch (event) {
        case 'loggedIn':
          this.checkUser()
          break
        case 'loggedOut':
          this.checkUser()
          break
      }
    })

    this.events.subscribe('chat:conversations', (event) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      console.log('conversations received  ', event)
      this.conversations = event
    })

    this.events.subscribe('chat:delete_conversation', (id) => {
      for (var i = 0; i < this.conversations.length; i++) {
        if (this.conversations[i]._id == id) {
          this.conversations.splice(i, 1);
        }
      }
    })
  }

  openCart() {
    this.events.publish('open:modal', 'cart')
  }

  unsubscribeToEvents() {
    var res1 = this.events.unsubscribe('auth:event');
    var res2 = this.events.unsubscribe('chat:event');

  }

  login() {
    this.events.publish('open:modal', 'login')
  }

  signup() {
    this.navCtrl.push('RegisterPage');
  }

  reload() {

    if (this.loggedIn) {

      this.myId = this.rt.getUser()._id

      // let loading = this.loadingCtrl.create({
      //   content: 'Loading ...',
      //   spinner: 'dots'
      // });
      //
      // loading.present()
      //

      this.rt.getConversations()

    }
  }

  getImage(url) {
    return url.indexOf("img/defaultImage.png") >= 0 ? "assets/imgs/defaultImage.png" : url
  }

  formatDate(date) {


    let start = moment(date)
    let end = moment()

    let duration = moment.duration(end.diff(start))
    let minutes = duration.asMinutes()


    var result = ""
    if (minutes < 60) {
      result = moment(date).startOf('minute').fromNow()
    }
    else if (minutes < 24 * 60) {
      result = moment(date).startOf('hour').fromNow()
    }
    else {
      result = moment(date).format('L')
    }


    return result
  }


  lastMessage(room) {
    let t = room.messages.length
    let msg = room.messages[t - 1]
    return msg.message
  }

  logout() {
    let confirm = this.alertCtrl.create({
      title: 'REELTRAIL',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Log Out',
          handler: () => {
            this.client.logout().then(res => {

            })
          }
        }
      ]
    })
    confirm.present()
  }

  checkUser() {
    this.loggedIn = this.rt.isLoggedIn()

  }

  open(conversation) {
    // this.navCtrl.push("ChatPage", {conversation : conversation})
    this.events.publish('open:modal', 'chat', conversation);

  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad MessagesPage');
    this.subscribeToEvents()
  }

  ionViewWillUnload() {

    this.unsubscribeToEvents()
  }

  ionViewWillEnter() {
    this.checkUser()
    this.reload()
  }


}
