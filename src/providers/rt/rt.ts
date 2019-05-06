import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import * as Immutable from 'immutable';
import { Platform, ToastController } from 'ionic-angular';
import _ from 'lodash';
import { Events } from 'ionic-angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import io from 'socket.io-client'
import { Push, PushObject, PushOptions } from '@ionic-native/push';


@Injectable()
export class RtProvider {

  pages: Immutable.OrderedMap<string, any> = Immutable.OrderedMap<string, any>();
  token: string = ""
  //apiUrl: string = "http://localhost:4000/api/v1"
  //apiUrl : string = "http://192.168.43.244:4000/api/v1"
  //apiUrl: string = "https://dev2.reeltrail.com/api/v1"
  apiUrl: string = "https://reeltrail.com/api/v1"

  //socketApi: string = "ws://dev2.reeltrail.com:3003"
  socketApi: string = "ws://reeltrail.com:3003"
  // socketApi : string = "ws://localhost:3003"

  loggedIn: boolean = false
  user: any = null
  socket: SocketIOClient.Socket


  constructor(public http: HttpClient, private events: Events, private transfer: FileTransfer, private push: Push, public plt: Platform, private toastCtrl: ToastController) {
    this.token = localStorage.getItem('token')
  }


  initPushNotifications() {
    this.push.hasPermission()
      .then((res: any) => {
        if (res.isEnabled) {
          //this.setupNotifications()
        } else { }
      });
  }

  setupNotifications() {
    const options: PushOptions = {
      android: {
        clearBadge: true
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'false',
        clearBadge: true
      },
      browser: {
        pushServiceURL: 'http://push.api.phonegap.com/v1/push'
      }
    }

    const pushObject: PushObject = this.push.init(options)
    pushObject.on('notification').subscribe((notification: any) => {
      let toast = this.toastCtrl.create({
        message: notification.additionalData.title + " - " + notification.additionalData.message,
        duration: 5000,
        position: 'top'
      });
      toast.onDidDismiss(() => { });
      toast.present();
    })
    pushObject.on('registration').subscribe((registration: any) => {
      this.registerDevice(registration.registrationId)
    })
    pushObject.on('error').subscribe(error => { })
  }
  //Log claim Api
  claim(claim): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/claim', claim)
        .subscribe(res => {
          resolve(res);
        }, err => {
          reject(err)
        })
    })
  }
  validateVoucher(code, amount): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/user/voucher/validate/' + code, { amount: amount })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  registerDevice(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let type = (this.plt.is('ios')) ? 'ios' : 'android'
      this.http.post(this.apiUrl + '/user/device', { token: token, type: type })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  login(user: { email: string, password: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/user/login', user)
        .subscribe((res: any) => {
          this.token = res.token
          this.loggedIn = true
          localStorage.setItem('token', this.token)
          this.events.publish('auth:event', 'loggedIn')
          this.silentLogin()
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }
  //Login Api
  loginwithFacebook(user): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/auth/facebook', user)
        .subscribe((res: any) => {
          this.token = res.token
          this.loggedIn = true
          localStorage.setItem('token', this.token)
          this.events.publish('auth:event', 'loggedIn')
          this.silentLogin()
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }
  //Login Api
  loginwithGoogle(user): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/auth/gplus', user)
        .subscribe((res: any) => {
          this.token = res.token
          this.loggedIn = true
          localStorage.setItem('token', this.token)
          this.events.publish('auth:event', 'loggedIn')
          this.silentLogin()
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  register(user: { email: string, password: string, firstName: string, lastName: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/user/register', user)
        .subscribe((res: any) => {
          this.token = res.token
          this.loggedIn = true
          localStorage.setItem('token', this.token)
          this.events.publish('auth:event', 'loggedIn')
          this.silentLogin()
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  checkEmail(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/user/check', { email: email })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }


  resetPassword(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/user/resetPassword', { email: email })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }


  logout(): Promise<any> {
    return new Promise(resolve => {
      localStorage.setItem("token", null)
      this.token = ""
      this.loggedIn = false
      this.user = null
      this.events.publish('auth:event', 'loggedOut');
      resolve(true)
    })
  }

  isLoggedIn(): boolean {
    return this.loggedIn
  }

  getUser(): any {
    return (this.user) ? this.user : {}
  }

  silentLogin() {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/user/')
        .subscribe((res: any) => {
          this.loggedIn = true
          this.user = res.user
          this.initChat()
          let asked = localStorage.getItem("askedForNotifications")
          if (asked == null) {
            //this.setupNotifications()
          }
          else {
            this.initPushNotifications()
          }
        }, err => { })
    })
  }

  getProfile(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/user/')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  updateProfile(profile): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(this.apiUrl + '/user/', profile)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  myRating(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/user/feedback/rating')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  searchGear(freeText: string): Promise<any> {
    return new Promise((resolve, reject) => {
      var url = '/listings/all/gear'
      url += '?limit=10&freeText=' + freeText
      this.http.get(this.apiUrl + url)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }


  getGear(level_1?: string, level_2?: string, level_3?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      var url = '/listings/all/gear'
      if (level_1) {
        url += `/${level_1}`
      }
      if (level_2) {
        url += `/${level_2}`
      }
      if (level_3) {
        url += `/${level_3}`
      }
      url += '?limit=10'
      this.http.get(this.apiUrl + url)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getMerchandise(level_1?: string, level_2?: string, level_3?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      var url = '/listings/all/merchandise'
      if (level_1) {
        url += `/${level_1}`
      }
      if (level_2) {
        url += `/${level_2}`
      }
      if (level_3) {
        url += `/${level_3}`
      }
      url += '?limit=10'
      this.http.get(this.apiUrl + url)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getFeaturedGear(): Promise<any> {
    return new Promise((resolve, reject) => {
      var url = '/listings/featured'
      this.http.get(this.apiUrl + url)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getAdventures(level_1?: string, level_2?: string, level_3?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      var url = '/listings/all/adventures'
      if (level_1) {
        url += `/${level_1}`
      }
      if (level_2) {
        url += `/${level_2}`
      }
      if (level_3) {
        url += `/${level_3}`
      }
      url += '?limit=10'
      this.http.get(this.apiUrl + url)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getGearDetails(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/listings/gear/' + id)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getAdventureDetails(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/listings/adventure/' + id)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  amIWatchinGear(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/watch/gear/' + id)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  watchGear(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(this.apiUrl + '/watch/gear/' + id, {})
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  unWatchGear(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.request('delete', this.apiUrl + '/watch/gear/' + id)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getWatchList(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/watch/list')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }


  addGearToCart(id: string, qty: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/cart/add', { gearId: id, qty: qty })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err.json())
        })
    })
  }

  removeGearFromCart(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/cart/remove', { gearId: id })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getCart(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/cart')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  cartCheckout(shippingAddressId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/cart/checkout', { shipping_address: shippingAddressId })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  expressCheckoutPaypal(gearId: string, qty: number, shippingAddress: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/cart/checkout/paypal', { gearId: gearId, qty: qty, shipping_address: shippingAddress })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }
  expressPaypalCheckout(cart: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/cart/checkout/express/paypal', cart)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  paypalMode(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/user/token/paypal')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }
  completePaypalCartOrder(data): Promise<any> {

    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/cart/order/express/paypal', data)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })

  }


  getAllAddresses(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/user/addresses')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getPrimaryAddress(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/user/addresses/primary')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  setAsPrimaryAddress(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/user/addresses/primary', { primaryAddressId: id })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  addAddress(address: { street1: string, street2?: string, city: string, state: string, zip: number }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/user/addresses', { address: address })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  deleteAddress(addressId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.request('delete', this.apiUrl + '/user/addresses/' + addressId)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getCategories(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/static/categories')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getCountries(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/static/countries')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  uploadImage(filename: string, fullPath: string): Promise<any> {
    return new Promise((resolve, reject) => {

      const fileTransfer: FileTransferObject = this.transfer.create();
      let options: FileUploadOptions = {
        fileKey: 'image',
        fileName: filename,
        headers: { 'Authorization': 'Bearer ' + this.token },
        params: {
          name: filename,
          filename: filename
        },
        chunkedMode: true
      }

      fileTransfer.upload(fullPath, this.apiUrl + '/images/upload', options, true)
        .then((data) => {
          resolve(JSON.parse(data.response))
        }, (err) => {
          resolve(err)
        })

    })
  }

  uploadImageWeb(file): Promise<any> {
    return new Promise((resolve, reject) => {
      let formData: FormData = new FormData();
      formData.append('image', file);
      formData.append('name', file.name);
      formData.append('filename', file.name);
      this.http.post(this.apiUrl + '/images/upload', formData)
        .subscribe(
          data => {
            resolve(data)
          }, error => {
            resolve(error)
          })
    })
  }

  getListingOptions(type = 'gear'): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/listing/options?type=' + type)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  addBankFunding(bank: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/user/funding', bank)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  addPaypalFunding(paypal: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/user/funding', paypal)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getFunding(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/user/funding')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  updateBankFunding(bank: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(this.apiUrl + '/user/funding', bank)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  updateToUsePaypalFunding(paypal: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(this.apiUrl + '/user/funding', paypal)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getSubscriptions(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/subscriptions')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getMySubscription(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/user/subscription')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getMyPurcahseOrders(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/orders?limit=10')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getMyShippingOrders(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/orders/shipping?limit=10')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getShippingOrder(order_id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/orders/shipping/' + order_id)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getMyGear(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/listings/user/gear?limit=10')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getMyAdventures(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/listings/user/adventures?limit=10')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  deleteGear(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = { type: 'gear', id: id }
      this.http.request('delete', this.apiUrl + '/list', { body: body })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  deleteAdventure(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let options = {
        body: { type: 'adventure', id: id }
      }
      options.body = { type: 'adventure', id: id }
      this.http.request('delete', this.apiUrl + '/list', options)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  addTracking(order_id: string, line_item_id: string, tracking: string, carrier: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/orders/shipping/tracking', { order_id: order_id, line_item_id: line_item_id, tracking: tracking, carrier: carrier })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  deleteTracking(order_id: string, line_item_id: string, tracking_id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = { order_id: order_id, line_item_id: line_item_id, tracking_id: tracking_id }
      this.http.request('delete', this.apiUrl + '/orders/shipping/tracking', { body: body })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getParcels(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/orders/shipping/parcels/list')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  createShipment(order_id: string, line_item_id: string, parcel_id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/orders/shipping/shipment', { order_id: order_id, parcel_id: parcel_id, line_item_id: line_item_id })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }
  shipmentRates(order): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/orders/shipping/rates', order)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getBtToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/user/token')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  buySubscription(slug: string, paymentMethodToken): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/user/subscription', { slug: slug, paymentMethodToken: paymentMethodToken })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  listGear(item: any, listingOptions: Array<string>, nonce: string, discount?: number, tracking_id?: string, voucher?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/list', { type: 'gear', item: item, listingOptions: listingOptions, nonce: nonce, discount: discount, tracking_id: tracking_id, voucher: voucher })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  editGear(id: string, item: any, listingOptions: Array<string>, nonce: string, discount?: number, tracking_id?: string, voucher?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(this.apiUrl + '/list', { type: 'gear', id: id, item: item, listingOptions: listingOptions, nonce: nonce, discount: discount, tracking_id: tracking_id, voucher: voucher })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  listAdventure(item: any, listingOptions: Array<string>, listingDays: number, nonce: string, discount?: number, tracking_id?: string, voucher?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/list', { type: 'adventure', item: item, listingDays: listingDays, listingOptions: listingOptions, nonce: nonce, discount: discount, tracking_id: tracking_id, voucher: voucher })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  editAdventure(id: string, item: any, listingOptions: Array<string>, listingDays: number, nonce: string, discount?: number, tracking_id?: string, voucher?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/list', { id: id, type: 'adventure', item: item, listingDays: listingDays, listingOptions: listingOptions, nonce: nonce, discount: discount, tracking_id: tracking_id, voucher: voucher })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }
  getPage(id: string) {

    return new Promise((resolve, reject) => {
      let page = this.pages.get(id);
      if (page) {
        resolve(page);
        return;
      }
      this.http.get(this.apiUrl + '/pages/view/' + id)
        .subscribe(res => {
          let r = res;
          this.pages = this.pages.set(id, r);
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  purchaseShippingLabel(order_id: string, line_item_id: string, rate: any, nonce: string, carrier: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/orders/shipping/shipment/label', { order_id: order_id, line_item_id: line_item_id, rate: rate, nonce: nonce, carrier: carrier })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }
  shippingStatus(order_id: string, line_item_id: string, tracking: any, carrier: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/orders/shipping/tracking/test', { order_id: order_id, line_item_id: line_item_id, tracking: tracking, carrier: carrier })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  placeOrder(order_id: string, nonce: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/cart/order', { order_id: order_id, nonce: nonce })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getNotifications(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/notifications')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  clearNotifications(id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.request('delete', this.apiUrl + '/notifications' + '/' + id)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getFeedback(order_id:string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/user/feedback/order/'+order_id)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }
  getAllFeedback(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/user/feedback')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  giveFeedback(feedbackId: string, feedback: string, rating: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/user/feedback', { feedbackId: feedbackId, feedback: feedback, rating: rating })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getOffersSent(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/offers/sent')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  getOffersReceived(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/offers/received')
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  sendOffer(gearId: string, offerAmount: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + '/offers/new', { gearId: gearId, offerAmount: offerAmount })
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  acceptOffer(offerId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(this.apiUrl + '/offers' + '/' + offerId + '/accept', {})
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  rejectOffer(offerId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(this.apiUrl + '/offers' + '/' + offerId + '/reject', {})
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  checkIfHasOffer(gearId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '/offers/check' + '/' + gearId)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }

  loadNextUrl(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  }



  initChat() {

    if (!this.loggedIn) return
    this.events.publish('start:messaging', 1)
    this.socket = io(this.socketApi + '?token=' + this.token)

    this.socket.on('connect', () => { })
    this.socket.on('conversations', (conversations) => {
      this.events.publish('chat:conversations', conversations)
    })

    this.socket.on('message_sent', (message) => {
      this.events.publish('chat:message_sent', message)
    })

    this.socket.on('new_message', (message) => {
      let toast = this.toastCtrl.create({
        message: `${message.author.name} - ${message.body}`,
        duration: 5000,
        position: 'top'
      });
      this.events.publish('chat:new_message', message)
    })
    this.socket.on('conversation_messages', (messages) => {
      this.events.publish('chat:conversation_messages', messages)
    })
    this.socket.on('disconnect', () => { })
    this.socket.on('error', (error) => { })
  }

  getConversations() {
    if (this.socket) {
      this.socket.emit('conversations')
    }
  }

  getConversationMessages(id: string) {
    if (this.socket) {
      this.socket.emit('conversation_messages', id)
    }
  }

  sendMessageToConversation(conversationId: string, body: string) {
    if (this.socket) {
      this.socket.emit('conversation_message', { conversation_id: conversationId, body: body })
    }
  }

  sendMessageToUser(toUserId: string, body: string) {
    if (this.socket) {
      this.socket.emit('message_user', { to_user_id: toUserId, body: body })
    }
  }
}
