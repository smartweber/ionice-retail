import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, ActionSheetController, NavParams, Events, Content, TextInput } from 'ionic-angular';
import { ClientProvider, ChatMessage } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import * as moment from 'moment';
import * as _ from 'lodash'
import { SortPipe } from '../../pipes/sort/sort';

/**
 * Generated class for the ChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  @ViewChild(Content) content: Content;
  @ViewChild('chat_input') messageInput: TextInput;

  conversation: any
  title = ""
  showEmojiPicker = false;
  editorMsg = '';
  user: any = null
  toUser: any = null
  messages: Array<any> = []
  myId: string = ""
  order: number=1;
  column: string = 'createdAt';
  constructor(public actionSheetCtrl: ActionSheetController, public navCtrl: NavController, public navParams: NavParams, public events: Events, private client: ClientProvider, private rt: RtProvider) {
    this.conversation = this.navParams.get('data')
    this.title = this.conversation.members[0].name
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad ChatPage')
    this.subscribeToEvents()
  }

  ionViewWillUnload() {
    this.unsubscribeToEvents()
  }

  ionViewDidEnter() {

    this.reload()
  }

  dismiss() {
    this.navCtrl.parent.getActive().dismiss()
  }

  deleteChat() {
    this.rt.socket.emit('delete_conversation', this.conversation._id);
    this.events.publish('chat:delete_conversation', this.conversation._id);
    this.dismiss();
  }

  messageAction(id: any) {
    let actionSheet = this.actionSheetCtrl.create({
      title: '',
      buttons: [
        {
          text: 'Delete Message',
          role: 'destructive',
          handler: () => {
            this.deleteMessage(id);
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }
  deleteMessage(id: any) {
    this.rt.socket.emit('delete_message', { conversation: this.conversation._id, messageId: id });
    for (var i = 0; i < this.messages.length; i++) {
      if (this.messages[i]._id == id) {
        this.messages.splice(i, 1);
      }
    }
  }
  reload() {

    this.myId = this.rt.getUser()._id

    this.rt.getConversationMessages(this.conversation._id)


    // this.client.getMessagesRoom(this.room._id).then(res =>{
    //
    //   this.messages = res.messages
    //   this.scrollToBottom()
    //
    //   if(this.client.userData._id == res.participants[1]._id){
    //     this.user = res.participants[1]
    //     this.toUser = res.participants[0]
    //   }
    //   else{
    //     this.user = res.participants[0]
    //     this.toUser = res.participants[1]
    //   }
    //
    //   console.log("messages ", this.messages)
    // },
    // err =>{
    //
    // })

  }

  ionViewWillLeave() {

  }

  switchEmojiPicker() {

    this.showEmojiPicker = !this.showEmojiPicker;
    if (!this.showEmojiPicker) {
      this.messageInput.setFocus();
    }
    this.content.resize();
    this.scrollToBottom();

  }

  sendMsg() {

    console.log('conversation ', this.conversation)



    let msg: any = {
      conversation: this.conversation._id,
      body: this.editorMsg,
      author: this.rt.getUser(),
      createdAt: moment().toISOString(),
      updatedAt: moment().toISOString()
    }

    this.editorMsg = ''
    // this.messages.push(msg)
    // this.scrollToBottom()


    this.rt.sendMessageToConversation(msg.conversation, msg.body)

  }

  onFocus() {
    // this.showEmojiPicker = false;
    this.content.resize();
    this.scrollToBottom();
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

  scrollToBottom() {
    setTimeout(() => {
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom();
      }
    }, 400)
  }

  subscribeToEvents() {
    this.events.subscribe('message:received', (messages) => {



      let m = _.last(messages.messages)
      if (m.senderId._id != this.user._id) {
        this.messages.push(m)
      }


    })

    this.events.subscribe('chat:conversation_messages', (messages) => {

      this.messages = messages
      this.scrollToBottom()

    })

    this.events.subscribe('chat:message_sent', (message) => {

      console.log('message sent ', message)
      this.messages.push(message)
      this.scrollToBottom()


    })

    this.events.subscribe('chat:new_message', (message) => {

      console.log('new_message ', message)
      this.messages.push(message)
      // this.scrollToBottom()


    })
  }
  unsubscribeToEvents() {
    var res1 = this.events.unsubscribe('message:received')
    var res2 = this.events.unsubscribe('chat:conversation_messages')

  }

}
