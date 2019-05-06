/**
 * @Author: Ruben
 * @Date:   2017-10-29T21:00:46-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-17T03:58:34-07:00
 */



import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, App, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { Events } from 'ionic-angular';
import moment from 'moment';
import { ImageViewerController } from "ionic-img-viewer";
import * as _ from 'lodash'
/**
 * Generated class for the ItemDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-item-details',
  templateUrl: 'item-details.html',
})
export class ItemDetailsPage {

  preview: boolean = false
  userId: string = ""
  item: any
  qty: number = 1
  watching: boolean = false
  watchId: string = ""
  qtyAlertOpts = {
    title: 'Quantity',
    subTitle: 'Select a quantity'
  }
  qtyOptions = []
  cart: any = null
  loggedIn: boolean = false

  isShownImgViewer = false;
  selectedIndex = 0;
  hasOffer: boolean = false

  addressId: string = null
  aSOpts = {
    title: 'Choose an Address',
    subTitle: ''
  }
  aOpts: Array<any> = []

  relatedItems: Array<any> = []
  @ViewChild('innerContainerRelated') innerContainerRelated: ElementRef

  constructor(public app: App, private events: Events, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController, public imageViewerCtrl: ImageViewerController) {
    this.item = navParams.get("item")
    let p = navParams.get("preview")
    this.preview = (p) ? p : false
    this.qtyOptions = Array(this.item.stock).fill(0).map((x, i) => i + 1);
    this.events.subscribe('cart:remove', (id) => {
      this.reload();
    });
    this.events.subscribe('address:reload', (id) => {
      this.rt.getAllAddresses().then(list => {
        this.aOpts = list.addresses
      })
    });
  }

  get inCart() {
    return this.cart && this.item && this.cart.content.find(c => { return c.items.find(i => i.gear._id == this.item._id) });
  }

  onClick(imageToView) {
    const viewer = this.imageViewerCtrl.create(imageToView)
    viewer.present();
  }

  ionViewDidLoad() {
    
  }

  ionViewWillEnter() {
    this.reload()
  }

  isPaypalOnly() {
    return this.item.postedBy.paypal == undefined
  }

  reload(silent: boolean = false) {

    this.loggedIn = this.rt.isLoggedIn()


    // if(this.client.userData){
    //   this.userId = this.client.userData._id
    //   this.preview = this.item.postedByUserId._id == this.userId
    // }

    // let loading = this.loadingCtrl.create({
    //   content: 'Loading ...',
    //   spinner: 'dots'
    // })
    // loading.present()

    if (this.loggedIn) {

      this.rt.getCart().then(res => {
        if (res.cart) {
          this.cart = res.cart
        }

      }, err => {
      })


      this.rt.amIWatchinGear(this.item._id).then(res => {
        this.watching = res.watching

      },
        err => {
          this.watching = false
        })

      if (this.item.offers) {

        this.rt.checkIfHasOffer(this.item._id).then(result => {
          if (result.offer) {
            this.hasOffer = true
          }
        })

      }


      this.rt.getAllAddresses().then(list => {

        this.aOpts = list.addresses
      })


      // this.client.isWatchingItem(this.item._id).then(res =>{
      //     // loading.dismiss()
      //     
      //     this.watching = res.watching
      //     this.watchId = res.watchId
      // },
      // err=>{
      //   // loading.dismiss()
      //   this.watching = false
      //   this.watchId = ""
      // })
    }


    //get related items
    if (!this.item.merchandise) {
      this.rt.getGear(this.item.category.level_1.id, this.item.category.level_2.id, this.item.category.level_3.id).then(list => {

        this.relatedItems = list.gear
        _.remove(this.relatedItems, (gear) => {
          return this.item._id == gear._id
        })

        this.innerContainerRelated.nativeElement.style.width = (12 * this.relatedItems.length) + 'em'

      })
    }


  }

  makeOffer() {
    if (!this.loggedIn) {
      let confirm = this.alertCtrl.create({
        title: 'REELTRAIL',
        message: 'Please login to make an offer.',
        buttons: [
          {
            text: 'Cancel',
            handler: () => {

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
        title: 'Offer to ' + this.item.postedBy.name,
        message: "Please enter the amount you wish to offer.  If it’s lower than the amount the seller is willing to accept, it’ll auto decline.",
        inputs: [
          {
            name: 'amount',
            placeholder: 'Amount you are willing to pay for this Gear'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {

            }
          },
          {
            text: 'SEND',
            handler: res => {

              let offerAmount = Number(res.amount)

              if (!offerAmount) {

                let confirm = this.alertCtrl.create({
                  title: 'REELTRAIL',
                  message: 'Please enter a vaild offer amount',
                  buttons: [
                    {
                      text: 'Cancel',
                      handler: () => {

                      }
                    },
                    {
                      text: 'OK',
                      handler: () => {

                      }
                    }
                  ]
                });
                confirm.present();
              }
              else if (offerAmount < this.item.offers.lowest) {

                let confirm = this.alertCtrl.create({
                  title: 'REELTRAIL',
                  message: 'The amount you offered is too low, please try another amount.',
                  buttons: [
                    {
                      text: 'Cancel',
                      handler: () => {

                      }
                    },
                    {
                      text: 'OK',
                      handler: () => {

                      }
                    }
                  ]
                });
                confirm.present();
              }
              else {
                let loading = this.loadingCtrl.create({
                  content: 'Sending offer ...',
                  spinner: 'dots'
                });

                loading.present()

                this.rt.sendOffer(this.item._id, offerAmount).then(result => {
                  loading.dismiss()
                  let confirm = this.alertCtrl.create({
                    title: 'REELTRAIL',
                    message: 'Offer placed successfully!.',
                    buttons: [
                      {
                        text: 'Cancel',
                        handler: () => {

                        }
                      },
                      {
                        text: 'OK',
                        handler: () => {

                        }
                      }
                    ]
                  });
                  confirm.present();
                },
                  err => {
                    loading.dismiss()
                    let confirm = this.alertCtrl.create({
                      title: 'REELTRAIL',
                      message: 'Offer placed successfully!',
                      buttons: [
                        {
                          text: 'Cancel',
                          handler: () => {

                          }
                        },
                        {
                          text: 'OK',
                          handler: () => {

                          }
                        }
                      ]
                    });
                    confirm.present();

                  })

              }
            }
          }
        ]
      });
      prompt.present()

    }
  }

  watchToggle() {
    if (!this.loggedIn) {
      let confirm = this.alertCtrl.create({
        title: 'REELTRAIL',
        message: 'Please login to watch this item.',
        buttons: [
          {
            text: 'Cancel',
            handler: () => {

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
      if (this.watching) {

        this.rt.unWatchGear(this.item._id).then(res => {
          this.reload()
        },
          err => {

          })

        // this.client.unwatch(this.watchId).then(res =>{
        //     this.reload()
        // })
      }
      else {
        this.rt.watchGear(this.item._id).then(res => {
          this.reload()
        },
          err => {

          })
        // let data = { listingId:this.item._id}
        // this.client.watchItem(data).then(res => {
        //   this.reload()
        // })

      }
    }
  }

  getPostedDate() {
    return moment(this.item.postedDate).format('MMMM Do YYYY')
  }

  removeFromCart() {
    let loading = this.loadingCtrl.create({
      content: 'Removing from Cart ...',
      spinner: 'dots'
    });
    loading.present()
    this.rt.removeGearFromCart(this.item._id).then(res => {
      this.reload();
      try { loading.dismiss(); } catch (e) { }
      this.postRemoveFromCart();
    },
      err => {
        try { loading.dismiss(); } catch (e) { }
        this.postRemoveFromCart();
      });
  }

  postRemoveFromCart() {
    let alert = this.alertCtrl.create({
      title: 'Success!',
      subTitle: 'Item successfully removed from your Cart!',
      buttons: [
        {
          text: 'Continue Shopping',
          handler: () => {
            this.navCtrl.pop();
          }
        },
        {
          text: 'View Cart',
          handler: () => {
            this.events.publish('open:modal', 'cart');
          }
        }

      ]
    })
    alert.present()
    this.reload();
  }

  addToCart() {

    if (!this.loggedIn) {

      let confirm = this.alertCtrl.create({
        title: 'REELTRAIL',
        message: 'Please login before adding this item to your cart.',
        buttons: [
          {
            text: 'Cancel',
            handler: () => {

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


    }
    else {

      let loading = this.loadingCtrl.create({
        content: 'Adding to Cart ...',
        spinner: 'dots'
      });

      loading.present()

      this.rt.addGearToCart(this.item._id, this.qty).then(res => {
        loading.dismiss()
        let alert = this.alertCtrl.create({
          title: 'Success!',
          subTitle: 'Item added to your Cart!',
          buttons: [
            {
              text: 'Continue Shopping',
              handler: () => {
                this.navCtrl.pop();
              }
            },
            {
              text: 'View Cart',
              handler: () => {
                this.events.publish('open:modal', 'cart');
              }
            }

          ]
        })
        alert.present();
        this.reload();
      },
        err => {
          try { loading.dismiss(); } catch (e) { }
          let alert = this.alertCtrl.create({
            title: 'Oh Uh!',
            subTitle: err.error.msg || "Item already exists in your cart",
            buttons: [
              {
                text: 'Continue Shopping',
                handler: () => {
                  this.navCtrl.pop();
                }
              },
              {
                text: 'View Cart',
                handler: () => {
                  this.events.publish('open:modal', 'cart');
                }
              }

            ]
          })
          alert.present();
          this.reload();
        })



      // this.client.addToCart({listingId:this.item._id, quantity:this.qty}).then(res => {
      //   loading.dismiss()
      //   let alert = this.alertCtrl.create({
      //     title: 'Success!',
      //     subTitle: 'Item added to your Cart!',
      //     buttons: [
      //       {
      //         text: 'Continue Shopping',
      //         handler: () => {
      //
      //         }
      //       },
      //       {
      //         text: 'View Cart',
      //         handler: () => {
      //           this.events.publish('open:modal', 'cart');
      //         }
      //       }
      //
      //     ]
      //   })
      //   alert.present()
      // },
      // err =>{
      //   loading.dismiss()
      //   let alert = this.alertCtrl.create({
      //     title: 'REELTRAIL',
      //     subTitle: 'There was an error adding this item to your cart. Please try again later',
      //     buttons: ['OK']
      //   })
      //   alert.present()
      //
      // })

    }

  }
  get isPaypal() {
    if (this.item['postedBy'] !== null && typeof this.item['postedBy'] === 'object') {
      return (this.item['postedBy'].paypal && this.item['postedBy'].paypal.active)
    }
    return false;
  }

  messsageSeller() {
    if (!this.loggedIn) {
      let confirm = this.alertCtrl.create({
        title: 'REELTRAIL',
        message: 'Please login to send a message.',
        buttons: [
          {
            text: 'Cancel',
            handler: () => {

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
        title: 'Message to ' + this.item.postedBy.name,
        message: "Please enter a message for " + this.item.postedBy.name + ". You may resume the conversation under the 'Messages' section.",
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

            }
          },
          {
            text: 'SEND',
            handler: res => {

              this.rt.sendMessageToUser(this.item.postedBy._id, res.message)
            }
          }
        ]
      });
      prompt.present()
    }
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

  expressCheckoutPaypal() {

    if (!this.loggedIn) {
      let confirm = this.alertCtrl.create({
        title: 'REELTRAIL',
        message: 'Please login before adding this item to your cart.',
        buttons: [
          {
            text: 'Cancel',
            handler: () => {

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
    }
    else {
      this.navCtrl.push("ExpressCheckoutAddressPage", { item: this.item, qty: this.qty, aOpts: this.aOpts, shippingAddress: this.addressId })
    }

  }
  checkoutPaypal() {

    let loading = this.loadingCtrl.create({
      content: 'Checking out. Please hold...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.expressCheckoutPaypal(this.item._id, this.qty, this.addressId).then(sale => {
      loading.dismiss()
      this.navCtrl.push("ExpressCheckoutPaypalPage", { sale: sale, item: this.item, qty: this.qty, shippingAddress: this.addressId })
    },
      err => {
        loading.dismiss()
        let alert = this.alertCtrl.create({
          title: 'REELTRAIL',
          subTitle: 'There was an error, please try again later',
          buttons: ['OK']
        })
        alert.present()
      })

  }

  view(item) {

    let loading = this.loadingCtrl.create({
      content: '',
      spinner: 'dots'
    })
    loading.present()

    let id = (item.id != undefined) ? item.id : item._id

    let preview = this.rt.getUser()._id == item.postedBy._id

    this.rt.getGearDetails(id).then(gear => {
      loading.dismiss()
      this.navCtrl.push("ItemDetailsPage", { item: gear, preview: preview })
    },
      err => {
        loading.dismiss()
      })

  }
}
