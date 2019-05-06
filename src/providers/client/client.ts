/**
 * @Author: Ruben
 * @Date:   2017-11-08T04:09:01-07:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-18T02:32:13-07:00
 */



import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/map';
import SockJS from 'sockjs-client';
import _ from 'lodash';
import { Events } from 'ionic-angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import * as uniqid from 'uniqid';
import * as btClient from 'braintree-web/client';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
/*
  Generated class for the ClientProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

declare var cordova: any;

export class ChatMessage {
  isRead: boolean;
  message: string;
  senderId: any;
  timestamp: string;
  _id: string;
  status?: string
}



@Injectable()
export class ClientProvider {

  // apiUrl: string = 'https://dev.reeltrail.com/rtapi/v1'
  // imagesApiUrl : string = "https://dev.reeltrail.com/rtimages/upload/image"
  // socketUrl: string = 'https://dev.reeltrail.com/sockjs/sockjs'
  //apiUrl : string = "http://localhost:3001/api/v1"
  apiUrl: string = 'https://www.reeltrail.com/api/v1'
  imagesApiUrl : string = "https://www.reeltrail.com/api/v1/images/upload"
  socketUrl: string = 'https://www.reeltrail.com/sockjs/sockjs'

  private _socket: any = null
  token: string = ""
  socketInfo: any = null
  isUserConfirmed: boolean = false
  isUserLoggedIn: boolean = false
  userData: any = null
  userProfileDetails: any = null
  userAccountDetails: any = null
  userPrimaryAddress: any = null
  timezones: any = null

  storeTokenKey: string = ""
  storeDataKey: string = ""

  counters: any = { cart: 0, notifications: 0, messages: 0 }

  btnClickCount = new BehaviorSubject(0);

  constructor(public http: HttpClient, private events: Events, private transfer: FileTransfer) {
    // this.initPushwoosh();
    // this.initSocket()
    this.token = localStorage.getItem('token')



  }

  initPushwoosh() {
    var pushwoosh = cordova.require("pushwoosh-cordova-plugin.PushNotification");

    // Should be called before pushwoosh.onDeviceReady
    document.addEventListener('push-notification', function(event: any) {
      var notification = event.notification;
      // handle push open here
    });

    // Initialize Pushwoosh. This will trigger all pending push notifications on start.
    pushwoosh.onDeviceReady({
      appid: 'DCC7E-63D74',
      projectid: "GOOGLE_PROJECT_NUMBER",
      serviceName: "MPNS_SERVICE_NAME"
    });

    pushwoosh.registerDevice(
      function(status) {
        var pushToken = status.pushToken;
          // handle successful registration here
      },
      function(status) {
        // handle registration error here
      }
    );
  }

  silentLogin() {
    if (this.token) {
      this.checkAccount().then(res => {
        console.log("checkAccount ", res)
        if (res) {
          this.getProfileDetails().then(user => {
            this.storeTokenKey = user.username + "token"
            this.storeDataKey = user.username + "data"
            this.isUserLoggedIn = true
            this.isUserConfirmed = res.isConfirmed
            this.events.publish('auth:event', 'loggedIn')
          })
        }
      })
    }
  }


  initSocket() {

    this._socket = new SockJS(this.socketUrl);

    let self = this
    this._socket.onopen = function() {

      console.log('rtSocket open');
      self.send({ command: "connect", message: "test" })


    };

    this._socket.onmessage = function(e) {

      let message = JSON.parse(e.data)

      console.log('rtSocket message', message)


      switch (message.channel) {

        case "device":
          if (message.data.id) {
            self.socketInfo = message.data
            self.send({ command: "verify", token: self.token })

            // self.silentLogin()
          }

          break

        case "user":

          if (message.command == "update" && message.data.user) {

            self.userProfileDetails = message.data.user
            self.userData = message.data.user
            self.isUserLoggedIn = true
            self.isUserConfirmed = message.data.user.isConfirmed
            self.send({ command: "counts", userId: message.data.user._id })

          }

          if (message.command == "counts") {


            self.events.publish('update:counters', message.data)
            self.counters = message.data
          }
          break

        case "messages":

          if (message.command == "receive") {


            self.events.publish('message:received', message.data)

          }
          break

        case "cart":

          if (message.command == "counter") {


            self.counters.cart = message.data.count
            self.events.publish('update:counters', self.counters)

          }
          break

      }

      // self._socket.close();

    };

    this._socket.onclose = function() {

      console.log(' rtSocket close');

    };
  }

  send(message) {
    let token = this.token
    let payload = _.assignIn({ token: token }, message)
    let paylodStr = JSON.stringify(payload)
    console.log(paylodStr)
    this._socket.send(paylodStr)
  }

  //Reset password

  resetPassword(user){

    return new Promise((resolve, reject) => {

      this.http.post(this.apiUrl + '/users/forgot', user)
        .subscribe((res:any) => {

          console.log("users/forgot --- ", res)
          resolve(res)

        },
        err => {
          console.log("users/forgot --- ", err)
          reject(err)
        }
        )

    })
  }

  checkEmail(data){

    return new Promise((resolve, reject) => {

      this.http.post(this.apiUrl + '/users/check/email', data)
        .subscribe(res => {

          console.log("/users/check/email --- ", res)
          resolve(null)

        },
        err => {
          console.log("/users/check/email --- ", err)
          reject({taken:true})
        }
        )

    })
  }

  checkUsername(data){

    return new Promise((resolve, reject) => {

      this.http.post(this.apiUrl + '/users/check/username', data)
        .subscribe(res => {

          console.log("/users/check/username --- ", res)
          resolve(null)

        },
        err => {
          console.log("error /users/check/username --- ", err)
          reject({usernameTaken : true})
        }
        )

    })

  }

  //Login Api
  login(user): Promise<any> {

    console.log("socketInfo ", this.socketInfo)

    user.socketid = this.socketInfo.id

    return new Promise(resolve => {
      this.http.post(this.apiUrl + '/users/login', user)
        .subscribe((res:any) => {

          console.log("login result --- ", res)

          this.token = res.token
          this.isUserLoggedIn = true
          this.isUserConfirmed = res.isConfirmed
          localStorage.setItem('token', this.token)
          this.events.publish('auth:event', 'loggedIn');

          this.checkAccount()

          resolve(res)

          // if (res.code == 200) {
          //   this._settings.saveUser(user, res.token)
          //   resolve(res)
          // }
          // else {
          //
          //   resolve(false)
          // }
        },
        err => {
          console.log("erro login result --- ", err)
          resolve(null)
        }
        )
    })
  }

  checkPassword(password): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/users/check/password', password)
        .subscribe(res => {
          console.log(' /users/check/password', res)
          resolve(res)

        },
        err => {
          console.log('error /users/check/password', err)
          reject(err)
        })
    })
  }

  uploadImage(filename, fullPath): Promise<any> {
    return new Promise((resolve, reject) => {

      const fileTransfer: FileTransferObject = this.transfer.create();

      let options: FileUploadOptions = {
        fileKey: 'file',
        fileName: filename,
        headers: {},
        params: {
          name: filename,
          filename: filename
        },
        chunkedMode: true
      }

      fileTransfer.upload(fullPath, this.imagesApiUrl, options, true)
        .then((data) => {
          // success
          console.log("success", data)
          resolve(JSON.parse(data.response))
        }, (err) => {
          // error
          console.log("error", err)
          resolve(err)
        })
    })
  }

  uploadImageWeb(file): Promise<any> {
    return new Promise((resolve, reject) => {

      let formData: FormData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('filename', file.name);
      this.http.post(this.imagesApiUrl, formData)
      .subscribe(
        data => {
          console.log('success')
          resolve(data)
        },
        error => {
          console.log(error)
          resolve(error)
        })
    })
  }
  //Logout
  logout(): Promise<any> {
    return new Promise(resolve => {

      localStorage.setItem("token", null)
      this.token = ""
      this.isUserConfirmed = false
      this.isUserLoggedIn = false
      this.userData = null
      this.userProfileDetails = null
      this.userAccountDetails = null
      this.userPrimaryAddress = null

      this.events.publish('auth:event', 'loggedOut');
      resolve(true)

    })
  }

  //Registration
  register(user): Promise<any> {

    user.socketid = this.socketInfo.id

    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/users/register/quick', user)
        .subscribe(res => {

          resolve(res)

        },
        err => {
          console.log('error /users/register/quick', err)
          reject(err)
        })
    })

  }

  //Account
  checkAccount(): Promise<any> {




    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/users/account')
        .subscribe(res => {

          console.log("/users/account --- ", res)
          this.userAccountDetails = res
          localStorage.setItem('userAccountDetails', JSON.stringify(res));

          resolve(res)
        },
        err => {
          console.log("error = /users/account --- ", err)
          reject(err)
        })
    })

  }

  //Account
  saveBankingInfo(bank): Promise<any> {




    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/accounts', bank)
        .subscribe(res => {

          console.log("/accounts --- ", res)

          resolve(res)
        },
        err => {
          console.log("error = /accounts --- ", err)
          reject(err)
        })
    })

  }

  getBankAccountInfo(merchantId): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/accounts/' + merchantId)
        .subscribe(res => {

          console.log("merchantId /accounts --- ", res)

          resolve(res)
        },
        err => {
          console.log("error  merchantId = /accounts --- ", err)
          reject(err)
        })
    })

  }

  //User Model
  getUserModel(): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/users/view')
        .subscribe(res => {

          console.log("/users/view --- ", res)

          resolve(res)
        },
        err => {
          console.log("error = /users/details --- ", err)
          reject(err)
        })
    })
  }

  //Profile
  getProfileDetails(): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/users/details')
        .subscribe(res => {

          console.log("/users/details --- ", res)
          this.userProfileDetails = res

          resolve(res)
        },
        err => {
          console.log("error = /users/details --- ", err)
          reject(err)
        })
    })
  }

  updateProfile(profile): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/users/details', profile)
        .subscribe(res => {

          console.log("/users/details --- ", res)
          this.userProfileDetails = res

          resolve(res)
        },
        err => {
          console.log("error = /users/details --- ", err)
          reject(err)
        })
    })

  }

  //Listing options prices

  getListingOptions(id): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/listings/options/' + id)
        .subscribe(res => {

          console.log("/listings/options/ id --- ", res)

          resolve(res)
        },
        err => {
          console.log("error = /listings/options/ id --- ", err)
          reject(err)
        })
    })
  }



  getListingOptionsPrices(): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/listings/options/prices')
        .subscribe(res => {

          console.log("/listings/options/prices --- ", res)

          resolve(res)
        },
        err => {
          console.log("error = /listings/options/prices --- ", err)
          reject(err)
        })
    })
  }

  //payments Tokens
  getBraintreeToken(): Promise<any> {


    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/tokens/all')
        .subscribe(res => {

          console.log("/tokens/all --- ", res)

          resolve(res)
        },
        err => {
          console.log("error = /tokens/all --- ", err)
          reject(err)
        })
    })
  }

  //Subscriptions
  getSubscriptions(): Promise<any> {

    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/resources/subscriptions')
        .subscribe(res => {

          console.log("/resources/subscriptions --- ", res)
          resolve(res)

        },
        err => {
          console.log("error = /resources/subscriptions --- ", err)
          reject(err)
        })
    })

  }

  //Get all timezones
  getTimezones(): Promise<any> {

    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/resources/timezones')
        .subscribe(res => {

          console.log("/resources/timezones --- ", res)
          this.timezones = res
          resolve(res)
        },
        err => {
          console.log("error = /resources/timezones --- ", err)
          reject(err)
        })
    })
  }

  getCountries(): Promise<any> {

    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/resources/countries')
        .subscribe(res => {

          console.log("/resources/countries --- ", res)
          this.timezones = res
          resolve(res)
        },
        err => {
          console.log("error = /resources/countries --- ", err)
          reject(err)
        })
    })
  }

  //Primary Address
  getPrimaryAddress(): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/addresses/primary')
        .subscribe(res => {

          console.log("/addresses/primary --- ", res)
          this.userPrimaryAddress = res

          resolve(res)
        },
        err => {
          console.log("error = /addresses/primary --- ", err)
          reject(err)
        })
    })
  }

  //All addresses
  getAllAddresses(): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/addresses/list', {})
        .subscribe(res => {

          console.log("/addresses/list --- ", res)

          resolve(res)
        },
        err => {
          console.log("error = /addresses/list --- ", err)
          reject(err)
        })
    })
  }

  validateAddress(address): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/addresses/validate', address)
        .subscribe(res => {

          console.log("/addresses/validate --- ", res)

          resolve(res)
        },
        err => {
          console.log("error = /addresses/validate --- ", err)
          reject(err)
        })
    })
  }

  saveAddress(address): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/addresses/save', address)
        .subscribe(res => {

          console.log("/addresses/save --- ", res)

          resolve(res)
        },
        err => {
          console.log("error = /addresses/save --- ", err)
          reject(err)
        })
    })
  }

  setAsPrimaryAddress(address): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/addresses/primary', address)
        .subscribe(res => {

          console.log("/addresses/primary --- ", res)

          resolve(res)
        },
        err => {
          console.log("error = /addresses/primary --- ", err)
          reject(err)
        })
    })
  }

  deleteAddress(address): Promise<any> {
  
    return new Promise((resolve, reject) => {
      this.http.request('delete',this.apiUrl + '/addresses',{body:address})
        .subscribe(res => {

          console.log("delete /addresses --- ", res)

          resolve(res)
        },
        err => {
          console.log("error delete /addresses --- ", err)
          reject(err)
        })
    })
  }

  //Notifications
  getAllNotifications(): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/notifications/user')
        .subscribe(res => {

          console.log("/notifications/user --- ", res)

          resolve(res)
        },
        err => {
          console.log("error = /notifications/user --- ", err)
          reject(err)
        })
    })
  }

  //Watch List

  getMyWatchList(): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/watches')
        .subscribe(res => {

          console.log("/watches --- ", res)

          resolve(res)
        },
        err => {
          console.log("error = /watches --- ", err)
          reject(err)
        })
    })
  }

  //unwatch

  unwatch(id): Promise<any> {

    var headers = new Headers();

    headers.append('Content-Type', 'application/json')
    headers.append('Accept', 'application/json')
    headers.append('x-access-token', this.token)
    // headers.append(  'x-access-socketid' , this.socketInfo.id)

    let params = {
      watchId: id
    }

    let options = {
      body: params
    }

    return new Promise((resolve, reject) => {
      this.http.request('delete',this.apiUrl + '/watches',options)
        .subscribe(res => {

          console.log("delete /watches --- ", res)

          resolve(true)
        },
        err => {
          console.log("error = delete /watches --- ", err)
          reject(err)
        })
    })
  }

  isWatchingItem(id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/watches/status/' + id)
        .subscribe(res => {

          console.log(" /watches/status --- ", res)
          resolve(res)
        },
        err => {
          console.log("error =  /watches/status --- ", err)
          reject(err)
        })
    })
  }

  watchItem(item): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/watches', item)
        .subscribe(res => {

          console.log("add /watches --- ", res)
          resolve(res)
        },
        err => {
          console.log("error = add  /watches --- ", err)
          reject(err)
        })
    })
  }

  //Get all user listings
  getMyItems(params): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/listings/search/user/all', params)
        .subscribe(res => {
          console.log('/listings/search/user/all ', res)
          resolve(res)

        },
        err => {
          console.log('error /listings/search/user/all', err)
          reject(JSON.parse(err._body))
        })
    })
  }

  getMySales(): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/sales')
        .subscribe(res => {
          console.log('/sales ', res)
          resolve(res)

        },
        err => {
          console.log('error /sales', err)
          reject(err)
        })
    })
  }

  //get all adventures posted by user
  getMyAdventures(params): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/adventures/search/user/all', params)
        .subscribe(res => {
          console.log('/adventures/search/user/all ', res)
          resolve(res)

        },
        err => {
          console.log('error /adventures/search/user/all', err)
          reject(JSON.parse(err._body))
        })
    })
  }

  deleteMyItemWith(id): Promise<any> {
    var headers = new Headers();

    headers.append('Content-Type', 'application/json')
    headers.append('Accept', 'application/json')
    headers.append('x-access-token', this.token)
    // headers.append(  'x-access-socketid' , this.socketInfo.id)

    let params = {
      _id: id
    }

    let options = { 
      body: params
    }

    return new Promise((resolve, reject) => {
      this.http.request('delete',this.apiUrl + '/listings',options)
        .subscribe(res => {
          console.log('delete /listings ', res)
          resolve(true)

        },
        err => {
          console.log('error /delete /listings', err)
          reject(err)
        })
    })
  }

  //delete posted adventure
  deleteMyAdventureWith(id): Promise<any> {
    let params = {
      _id: id
    }

    let options = { 
      body: params
    }

    return new Promise((resolve, reject) => {
      this.http.request('delete',this.apiUrl + '/adventures',options)
        .subscribe(res => {
          console.log('delete /adventures ', res)
          resolve(true)

        },
        err => {
          console.log('error /delete /adventures', err)
          reject(err)
        })
    })
  }

  getMyPurchases(): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/purchases/user')
        .subscribe(res => {

          console.log("/purchases/user --- ", res)

          resolve(res)
        },
        err => {
          console.log("error = /purchases/user --- ", err)
          reject(err)
        })
    })
  }

  getMyFeedback(): Promise<any> {



    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/feedback/user')
        .subscribe(res => {

          console.log("/feedback/user --- ", res)

          resolve(res)
        },
        err => {
          console.log("error = /feedback/user --- ", err)
          reject(err)
        })
    })
  }

  sendFeedback(feedback) {



    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/feedback', feedback)
        .subscribe(res => {
          console.log('/feedback ', res)
          resolve(res)

        },
        err => {
          console.log('error /feedback', err)
          reject(err)
        })
    })

  }


  getAllCategories(): Promise<any> {

    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/categories/main')
        .subscribe(res => {

          console.log("/resources/categories --- ", res)

          resolve(res)
        },
        err => {

          reject(err)
        })
    })

  }



  getAllListings(start, row, sort): Promise<any> {

    return new Promise(resolve => {

      let data = {
        start: start,
        rows: row,
        type: 'Listing',
        sort: sort
      }
      this.http.post(this.apiUrl + '/listings/search/all', data)
        .subscribe(res => {

          console.log("/listings/search/all --- ", res)

          resolve(res)
        })
    })
  }

  getAllAdventures(start, row, sort): Promise<any> {

    return new Promise(resolve => {

      let data = {
        start: start,
        rows: row,
        type: 'Adventure',
        sort: sort
      }
      this.http.post(this.apiUrl + '/adventures/search/all', data)
        .subscribe(res => {

          console.log("/adventures/search/all --- ", res)

          resolve(res)
        })
    })
  }

  getListingsByCategoryFilter(filter): Promise<any> {

    return new Promise((resolve, reject) => {

      this.http.post(this.apiUrl + '/categories/selected', filter)
        .subscribe(res => {

          console.log("/categories/selected --- ", res)

          resolve(res)
        },
        err => {
          console.log("error /categories/selected --- ", err)

          reject(err)
        })
    })
  }

  getListingItem(id): Promise<any> {

    return new Promise(resolve => {

      this.http.get(this.apiUrl + '/listings/view/' + id)
        .subscribe(res => {

          console.log("/listings/view/id --- ", res)

          resolve(res)
        })
    })
  }

  getRatingsByUsername(username): Promise<any> {

    return new Promise(resolve => {

      this.http.get(this.apiUrl + '/feedback/average/' + username)
        .subscribe(res => {

          console.log("/feedback/average --- ", res)

          resolve(res)
        })
    })
  }

  getAdventure(id): Promise<any> {

    return new Promise(resolve => {

      this.http.get(this.apiUrl + '/adventures/view/' + id)
        .subscribe(res => {

          console.log("/adventures/view/id --- ", res)

          resolve(res)
        })
    })
  }

  listItem(item): Promise<any> {


    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/listings/add', item)
        .subscribe(res => {
          console.log('/listings/add ', res)
          resolve(res)

        },
        err => {
          console.log('error /listings/add', err)
          reject(err)
        })
    })
  }



  listingSave(item): Promise<any> {


    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/listings/save', item)
        .subscribe(res => {
          console.log('/listings/save ', res)
          resolve(res)

        },
        err => {
          console.log('error /listings/save', err)
          reject(err)
        })
    })
  }

  getAdventureOptions(id): Promise<any> {


    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/adventures/options/' + id)
        .subscribe(res => {
          console.log('/adventures/options ', res)
          resolve(res)

        },
        err => {
          console.log('error /adventures/options', err)
          reject(err)
        })
    })
  }

  listAdventure(adventure): Promise<any> {


    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/adventures/add', adventure)
        .subscribe(res => {
          console.log('/adventures/add ', res)
          resolve(res)

        },
        err => {
          console.log('error /adventures/add', err)
          reject(err)
        })
    })
  }

  saveAdventure(adventure): Promise<any> {


    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/adventures/save', adventure)
        .subscribe(res => {
          console.log('/adventures/save ', res)
          resolve(res)

        },
        err => {
          console.log('error /adventures/save', err)
          reject(err)
        })
    })
  }

  payListingOptions(transaction): Promise<any> {


    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/listings/options/pay', transaction)
        .subscribe(res => {
          console.log('/listings/options/pay ', res)
          resolve(res)

        },
        err => {
          console.log('error /listings/options/pay', err)
          reject(err)
        })
    })

  }

  payAdventure(transaction): Promise<any> {


    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/adventures/pay', transaction)
        .subscribe(res => {
          console.log('/adventures/pay ', res)
          resolve(res)

        },
        err => {
          console.log('error /adventures/pay', err)
          reject(err)
        })
    })

  }

  searchItem(url, data): Promise<any> {
    return new Promise(resolve => {

      this.http.post(this.apiUrl + url, data)
        .subscribe(res => {

          console.log(url);

          resolve(res)
        })

    })
  }

  searchFreetextListing(data): Promise<any> {
    return new Promise((resolve, reject) => {

      this.http.post(this.apiUrl + '/listings/search/freetext', data)
        .subscribe(res => {
          resolve(res)
        },
        err => {
          reject(err)
        })

    })
  }

  searchFreetextAdventure(data): Promise<any> {
    return new Promise((resolve, reject) => {

      this.http.post(this.apiUrl + '/adventures/search/freetext', data)
        .subscribe(res => {
          resolve(res)
        },
        err => {
          reject(err)
        })

    })
  }

  validateCard(card): Promise<any> {
    return new Promise((resolve, reject) => {

      this.getBraintreeToken().then(res => {

        console.log("got bt token ", res)

        let t = res.clientToken

        btClient.create({ authorization: t }).then(client => {
          console.log("bt client ", res)

          var data = {
            creditCard: {
              number: card.number,
              cvv: card.cvv,
              expirationYear: card.expirationYear,
              expirationMonth: card.expirationMonth,
              billingAddress: {
                postalCode: card.postalCode
              },
              options: {
                validate: true
              }
            }
          }

          client.request({
            endpoint: 'payment_methods/credit_cards',
            method: 'post',
            data: data
          }).then(res => {
            console.log("card validated ", res)
            resolve(res)
          },
            err => {
              console.log("card error ", err)
              reject({ msg: "invalid card" })
            })
        },
          err => {
            console.log("error creating bt client")
          })
      })

    })
  }

  savePaymentMethod(card): Promise<any> {

    card.id = uniqid()

    return new Promise((resolve, reject) => {

      var data: any = localStorage.getItem(this.storeDataKey)
      var methods: any

      if (data == null) {
        methods = []
      }
      else {
        methods = JSON.parse(data)
      }

      this.getBraintreeToken().then(res => {

        console.log("got bt token ", res)

        let t = res.clientToken

        btClient.create({ authorization: t }).then(client => {
          console.log("bt client ", res)

          var data = {
            creditCard: {
              number: card.number,
              cvv: card.cvv,
              expirationYear: card.expirationYear,
              expirationMonth: card.expirationMonth,
              billingAddress: {
                postalCode: card.postalCode
              },
              options: {
                validate: true
              }
            }
          }

          client.request({
            endpoint: 'payment_methods/credit_cards',
            method: 'post',
            data: data
          }).then(res => {
            console.log("card validated ", res)

            methods.push(card)
            localStorage.setItem(this.storeDataKey, JSON.stringify(methods))
            resolve(true)
          },
            err => {
              console.log("card error ", err)
              reject({ msg: "invalid card" })
            })
        },
          err => {
            console.log("error creating bt client")
          })
      })

    })
  }

  getPaymentMethods(): Promise<any> {

    return new Promise(resolve => {

      var data: any = localStorage.getItem(this.storeDataKey)
      var methods: any

      if (data == null) {
        methods = []
      }
      else {
        methods = JSON.parse(data)
      }


      resolve(methods)

    })

  }

  deletePaymentMethod(method): Promise<any> {

    return new Promise(resolve => {

      var data: any = localStorage.getItem(this.storeDataKey)

      var methods: any

      if (data == null) {

        methods = []
      }
      else {

        methods = JSON.parse(data)
      }

      console.log("deleteing ", methods)
      var res = _.remove(methods, function(m) {
        console.log(m, method)
        return m.id == method.id;
      });

      localStorage.setItem(this.storeDataKey, JSON.stringify(methods))

      resolve(true)

    })

  }


  getMyShoppingCart(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/cart')
        .subscribe(res => {
          console.log('/cart ', res)
          resolve(res)

        },
        err => {
          console.log('error /cart', err)
          reject(err)
        })
    })

  }

  addToCart(item): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/cart', item)
        .subscribe(res => {
          console.log('add /cart ', res)
          resolve(res)

        },
        err => {
          console.log('error add /cart', err)
          reject(err)
        })
    })

  }

  removeFormCart(item): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.request('delete',this.apiUrl + '/cart',{body:item})
        .subscribe(res => {
          console.log('delete /cart ', res)
          resolve(res)

        },
        err => {
          console.log('error delete /cart', err)
          reject(err)
        })
    })

  }

  getItemsTaxes(name, items): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/taxes', items)
        .subscribe((res:any) => {
          console.log(' /taxes ', res)
          res.sellerName = name
          resolve(res)

        },
        err => {
          console.log('error  /taxes', err)
          reject(err)
        })
    })

  }

  getSellerInfomation(id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/cart/payment/' + id)
        .subscribe(res => {
          console.log(' /cart/payment/ ', res)
          resolve(res)

        },
        err => {
          console.log('error  /cart/payment/', err)
          reject(err)
        })
    })

  }

  getAllMessages(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/messaging/user')
        .subscribe(res => {
          console.log(' /messaging/user', res)
          resolve(res)

        },
        err => {
          console.log('error  /messaging/user', err)
          reject(err)
        })
    })

  }

  getMessagesRoom(id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/messaging/' + id)
        .subscribe(res => {
          console.log(' /messaging/id', res)
          resolve(res)

        },
        err => {
          console.log('error  /messaging/id', err)
          reject(err)
        })
    })

  }

  sendMessage(msg): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/messaging/', msg)
        .subscribe(res => {
          console.log(' /messaging/', res)
          resolve(res)

        },
        err => {
          console.log('error  /messaging/', err)
          reject(err)
        })
    })

  }

  cartProcessCheckout(cart): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/cart/checkout', cart)
        .subscribe(res => {
          console.log(' /cart/checkout ', res)
          resolve(res)

        },
        err => {
          console.log('error  /cart/checkout', err)
          reject(err)
        })
    })

  }

  reverseGeolocation(placeId): Promise<any> {

    return new Promise((resolve, reject) => {
      this.http.get('https://maps.googleapis.com/maps/api/place/details/json?placeid=' + placeId + '&key=AIzaSyC9ZS8OtX2pY3inf8pecocumqJjjUB44Ns')
        .subscribe(res => {
          console.log(' reverse geo ', res)
          resolve(res)

        },
        err => {
          console.log('error  reverse geo', err)
          reject(err)
        })
    })

  }

  getParcels () : Promise<any> {

      return new Promise((resolve, reject) => {

          this.http.get(this.apiUrl + '/resources/parcels')
            .subscribe(res => {
              console.log(' /resources/parcels ', res)
              resolve(res)

            },
            err => {
              console.log('error  /resources/parcels', err)
              reject(err)
            })


      })
  }

  getSaleById (id) : Promise<any> {

      return new Promise((resolve, reject) => {
        this.http.get(this.apiUrl + '/sales/' + id)
          .subscribe(res => {
            console.log(' /sales/ ', res)
            resolve(res)

          },
          err => {
            console.log('error  /sales/', err)
            reject(err)
          })


      })
  }

  addTracking (data) : Promise<any> {

      return new Promise((resolve, reject) => {
        this.http.post(this.apiUrl + '/shipping/tracking/status', data)
          .subscribe(res => {
            console.log(' /shipping/tracking/status ', res)
            resolve(res)

          },
          err => {
            console.log('error  /shipping/tracking/status', err)
            reject(err)
          })


      })
  }

  getRates (data) : Promise<any> {

      return new Promise((resolve, reject) => {

        
        this.http.post(this.apiUrl + '/shipping/carrier/rates', data)
          .subscribe(res => {
            console.log(' /shipping/carrier/rates ', res)
            resolve(res)

          },
          err => {
            console.log('error  /shipping/carrier/rates', err)
            reject(err)
          })


      })
  }


  buyLabel (data) : Promise<any> {

      return new Promise((resolve, reject) => {

        
        this.http.post(this.apiUrl + '/shipping/buy', data)
          .subscribe(res => {
            console.log(' /shipping/buy ', res)
            resolve(res)

          },
          err => {
            console.log('error  /shipping/buy', err)
            reject(err)
          })


      })
  }


  saveLabel (data) : Promise<any> {

      return new Promise((resolve, reject) => {

        
        this.http.post(this.apiUrl + '/shipping/carrier/label/save', data)
          .subscribe(res => {
            console.log(' /shipping/carrier/label/save ', res)
            resolve(res)

          },
          err => {
            console.log('error  /shipping/carrier/label/save', err)
            reject(err)
          })


      })
  }

}
