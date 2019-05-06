import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { Events } from 'ionic-angular';
import { RtProvider } from '../../providers/rt/rt';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  showProfile: boolean = false

  loggedIn: boolean = false


  name: string = ""
  location: string = ""
  dob: string = ""
  username: string = ""
  profileImg: string = ''
  rating: number = 0
  reviews: number = 0
  stars: Array<string> = ["ios-star-outline", "ios-star-outline", "ios-star-outline", "ios-star-outline", "ios-star-outline"]
  sold: number = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private events: Events, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private rt: RtProvider) {


    this.loggedIn = rt.isLoggedIn()

  }

  rate(n:any){

  }
  login() {
    this.events.publish('open:modal', 'login')
  }

  signup() {
    // this.navCtrl.push('RegisterPage');
    this.events.publish('open:modal', 'signup')
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad ProfilePage');

    this.subscribeToEvents()

  }

  ionViewWillEnter() {
    this.loadProfile()
  }

  updateRating() {

    for (var i = 0; i < this.stars.length; i++) {
      if ((i + 1) / this.rating <= 1) {
        this.stars[i] = "ios-star"
      }
      else {
        this.stars[i] = "ios-star-outline"
      }
    }

  }

  subscribeToEvents() {
    this.events.subscribe('auth:event', (event) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      console.log('profile Page ----User Logged In ', event);

      switch (event) {
        case 'loggedIn':
          this.loadProfile()
          break
        case 'loggedOut':
          this.loggedIn = false
          this.showProfile = false
          break
      }
    })
  }

  ionViewWillUnload() {

    this.unsubscribeToEvents()
  }
  capital_letter(str) {
    str = str.split(" ");
    for (var i = 0, x = str.length; i < x; i++) {
      str[i] = str[i][0].toUpperCase() + str[i].substr(1).toLowerCase();
    }

    return str.join(" ");
  }

  loadProfile() {
    //TODO fix email confirmation new behaivior



    this.rt.getProfile().then(profile => {
      //console.log("profile ", profile)
      this.loggedIn = true
      let name = this.capital_letter(profile.user.name || '');
      this.username = name
      this.profileImg = profile.user.profileImage.secure_url

      this.location = (profile.user.primaryAddress && profile.user.primaryAddress.city) ? profile.user.primaryAddress.city + ", " + profile.user.primaryAddress.state : ""


      let loading = this.loadingCtrl.create({
        content: 'Loading ...',
        spinner: 'dots'
      })

      this.rt.myRating().then(res => {
        this.rating = res.rating
        this.reviews = res.reviews
        this.updateRating()
        this.showProfile = true

      });
      this.rt.getMyShippingOrders().then(list => {
        loading.dismiss()
        this.sold = list.orders ? list.orders.length : 0;
      },
        err => {

        })
    },
      err => {

        console.log("error user not loged in ", err)

      })


    // if(this.loggedIn ){
    //
    //   let loading = this.loadingCtrl.create({
    //     content: 'Loading ...',
    //     spinner: 'dots'
    //   });
    //
    //   loading.present()
    //
    //   this.client.getProfileDetails().then(res => {
    //     this.name = res.firstName + " " + res.lastName
    //     this.username = res.username
    //     this.profileImg = res.profileImage.indexOf("img/defaultImage.png") >= 0 ? "assets/imgs/defaultImage.png" : res.profileImage
    //
    //     this.client.getRatingsByUsername(this.username).then(res =>{
    //
    //       this.rating = res.average
    //       this.reviews = res.reviews
    //
    //       this.updateRating()
    //
    //     })
    //
    //     loading.dismiss()
    //
    //     setTimeout(()=>{
    //       this.showProfile = true
    //     },500)
    //   },
    //   err => {
    //     loading.dismiss()
    //   })
    //
    //   this.client.getPrimaryAddress().then(res=>{
    //     if(res.city){
    //         this.location = res.city + ", " + res.state
    //     }
    //   })
    //
    //   this.client.getTimezones()
    //
    // }

  }
  open(category, section) {
    if (category == "merchandise") {
      this.navCtrl.push("MerchandisePage", { category: category, section: section })
    } else if (category == "gear") {
      this.navCtrl.push("GearListingsPage", { category: category, section: section })
    } else {
      this.navCtrl.push("AdventureListingsPage", { category: category, section: section })
    }
  }

  goTo(page) {
    this.navCtrl.push(page)
  }

  edit() {
    this.navCtrl.push("ProfileEditPage")
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
            this.rt.logout().then(res => {
              // localStorage.removeItem('userAccountDetails');
            })
          }
        }
      ]
    })
    confirm.present()
  }

  unsubscribeToEvents() {
    var res1 = this.events.unsubscribe('auth:event');

  }

}
