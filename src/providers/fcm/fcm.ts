import { RtProvider } from '../rt/rt';
import { Injectable } from '@angular/core';
import { FCM } from '@ionic-native/fcm';
import { Platform, ToastController } from 'ionic-angular';
import { Subject } from 'rxjs';
import { Events } from 'ionic-angular';

@Injectable()
export class FcmProvider {
  public eventSubject = new Subject();
  token:string='';
  constructor(
    public rt: RtProvider,//use this service
    public fcm: FCM,
    private events: Events,
    public platform: Platform,
    public toastCtrl: ToastController,
  ) {
    
  }
  getToken(){
    if (this.platform.is('cordova')) {
      this.fcm.getToken().then(token => {
        this.token = token;
      });            
      
      this.fcm.onTokenRefresh().subscribe(token => {
        this.rt.registerDevice(token);
      });
    }
    this.fcm.subscribeToTopic('general');
    this.events.subscribe("auth:event",(s)=>{
      setTimeout(()=>{this.listenToNotifications();},100);
    })
  }
  public saveToken() {
    if (!this.token) return;
    return this.rt.registerDevice(this.token);
  }

  listenToNotifications() {
    this.fcm.onNotification().subscribe(data => {
      console.log(data);
      if(data.wasTapped){
        console.log("Received in background");
      } else {
        console.log("Received in foreground");
      };
      this.events.publish('notification:event', 'reload')
    });
   this.saveToken();
  }

  sendNotification() {}
}
