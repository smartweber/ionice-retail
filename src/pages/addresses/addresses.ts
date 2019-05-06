import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { ItemSliding } from 'ionic-angular';
import * as _ from 'lodash';
/**
 * Generated class for the AddressesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addresses',
  templateUrl: 'addresses.html',
})
export class AddressesPage {

  primaryAddress : any = null
  addresses : Array<any> = []

  constructor(public navCtrl: NavController, public navParams: NavParams,  public alertCtrl: AlertController,private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController) {

  }

  isEmpty(address){
    return _.isEmpty(address)
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad AddressesPage');
  }

  ionViewWillEnter(){
    this.reload()
  }

  reload(){

    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    })
    loading.present()

    this.rt.getAllAddresses().then(result => {
      this.addresses = result.addresses
      loading.dismiss()
      console.log('Addresses ' , this.addresses)
    },
    err =>{

    })

    this.rt.getPrimaryAddress().then (primary =>{
      this.primaryAddress = primary.address
      console.log('primary addess ' , this.primaryAddress)
    },
    err =>{

    })

  }

  newAddress(){

    this.navCtrl.push("NewAddressPage")
  }

  makePrimary(slide : ItemSliding, address){
    slide.close()

    let confirm = this.alertCtrl.create({
      title: 'REELTRAIL',
      message: 'Are you sure you want to make this your primary address?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'MAKE PRIMARY',
          handler: () => {

            let loading = this.loadingCtrl.create({
              content: 'Updating ...',
              spinner: 'dots'
            })
            loading.present()

            this.rt.setAsPrimaryAddress(address._id).then(res =>{
              loading.dismiss()
              this.reload()
            },
            err =>{
              loading.dismiss()
                //error making as primary
                let alert = this.alertCtrl.create({
                  title: 'REELTRAIL',
                  subTitle: 'There was an error setting the address as primary.',
                  buttons: ['OK']
                })
                alert.present()
            })


            // this.client.setAsPrimaryAddress({addressId:address}).then(res=>{
            //   loading.dismiss()
            //   this.reload()
            // },
            // err=>{
            //   loading.dismiss()
            //   //error making as primary
            //   let alert = this.alertCtrl.create({
            //     title: 'REELTRAIL',
            //     subTitle: 'There was an error setting the address as primary.',
            //     buttons: ['OK']
            //   })
            //   alert.present()
            // })

          }
        }
      ]
    })
    confirm.present()


  }

  delete(slide: ItemSliding, address){
    slide.close()

    let confirm = this.alertCtrl.create({
      title: 'REELTRAIL',
      message: 'Are you sure you want to delete this address?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'DELETE',
          handler: () => {

            let loading = this.loadingCtrl.create({
              content: 'Deleting ...',
              spinner: 'dots'
            })
            loading.present()

            this.rt.deleteAddress(address._id).then(result=>{
              loading.dismiss()
              this.reload()
            },
            err =>{
              loading.dismiss()
              let alert = this.alertCtrl.create({
                title: 'REELTRAIL',
                subTitle: 'There was an error setting the address as primary.',
                buttons: ['OK']
              })
              alert.present()
            })
          }
        }
      ]
    })
    confirm.present()

  }

  editAddress(slide : ItemSliding, address){
    slide.close()
  }

}
