import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { FormBuilder, Validators,FormControl } from '@angular/forms';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { Events } from 'ionic-angular';

/**
 * Generated class for the NewAddressPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-new-address',
  templateUrl: 'new-address.html',
})
export class NewAddressPage {

  public addressForm = this.fb.group({
    name: ['', Validators.required],
    street1: ['', Validators.required],
    street2: [''],
    state: [''],
    city: ['', Validators.required],
    country: ['US', Validators.required],
    email: [''],
    zip: ['', Validators.compose([Validators.required, Validators.minLength(5)])],
    phone: ['', Validators.compose([Validators.required, Validators.minLength(10)])]
  },this.usMatchStateValidator);

  state: string = ""
  states = [
    { name: 'ALABAMA', abbreviation: 'AL' },
    { name: 'ALASKA', abbreviation: 'AK' },
    { name: 'AMERICAN SAMOA', abbreviation: 'AS' },
    { name: 'ARIZONA', abbreviation: 'AZ' },
    { name: 'ARKANSAS', abbreviation: 'AR' },
    { name: 'CALIFORNIA', abbreviation: 'CA' },
    { name: 'COLORADO', abbreviation: 'CO' },
    { name: 'CONNECTICUT', abbreviation: 'CT' },
    { name: 'DELAWARE', abbreviation: 'DE' },
    { name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC' },
    { name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM' },
    { name: 'FLORIDA', abbreviation: 'FL' },
    { name: 'GEORGIA', abbreviation: 'GA' },
    { name: 'GUAM', abbreviation: 'GU' },
    { name: 'HAWAII', abbreviation: 'HI' },
    { name: 'IDAHO', abbreviation: 'ID' },
    { name: 'ILLINOIS', abbreviation: 'IL' },
    { name: 'INDIANA', abbreviation: 'IN' },
    { name: 'IOWA', abbreviation: 'IA' },
    { name: 'KANSAS', abbreviation: 'KS' },
    { name: 'KENTUCKY', abbreviation: 'KY' },
    { name: 'LOUISIANA', abbreviation: 'LA' },
    { name: 'MAINE', abbreviation: 'ME' },
    { name: 'MARSHALL ISLANDS', abbreviation: 'MH' },
    { name: 'MARYLAND', abbreviation: 'MD' },
    { name: 'MASSACHUSETTS', abbreviation: 'MA' },
    { name: 'MICHIGAN', abbreviation: 'MI' },
    { name: 'MINNESOTA', abbreviation: 'MN' },
    { name: 'MISSISSIPPI', abbreviation: 'MS' },
    { name: 'MISSOURI', abbreviation: 'MO' },
    { name: 'MONTANA', abbreviation: 'MT' },
    { name: 'NEBRASKA', abbreviation: 'NE' },
    { name: 'NEVADA', abbreviation: 'NV' },
    { name: 'NEW HAMPSHIRE', abbreviation: 'NH' },
    { name: 'NEW JERSEY', abbreviation: 'NJ' },
    { name: 'NEW MEXICO', abbreviation: 'NM' },
    { name: 'NEW YORK', abbreviation: 'NY' },
    { name: 'NORTH CAROLINA', abbreviation: 'NC' },
    { name: 'NORTH DAKOTA', abbreviation: 'ND' },
    { name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP' },
    { name: 'OHIO', abbreviation: 'OH' },
    { name: 'OKLAHOMA', abbreviation: 'OK' },
    { name: 'OREGON', abbreviation: 'OR' },
    { name: 'PALAU', abbreviation: 'PW' },
    { name: 'PENNSYLVANIA', abbreviation: 'PA' },
    { name: 'PUERTO RICO', abbreviation: 'PR' },
    { name: 'RHODE ISLAND', abbreviation: 'RI' },
    { name: 'SOUTH CAROLINA', abbreviation: 'SC' },
    { name: 'SOUTH DAKOTA', abbreviation: 'SD' },
    { name: 'TENNESSEE', abbreviation: 'TN' },
    { name: 'TEXAS', abbreviation: 'TX' },
    { name: 'UTAH', abbreviation: 'UT' },
    { name: 'VERMONT', abbreviation: 'VT' },
    { name: 'VIRGIN ISLANDS', abbreviation: 'VI' },
    { name: 'VIRGINIA', abbreviation: 'VA' },
    { name: 'WASHINGTON', abbreviation: 'WA' },
    { name: 'WEST VIRGINIA', abbreviation: 'WV' },
    { name: 'WISCONSIN', abbreviation: 'WI' },
    { name: 'WYOMING', abbreviation: 'WY' }
  ]

  public countries : Array<any> = []
 
  constructor(private events: Events,public navCtrl: NavController, public navParams: NavParams, public fb: FormBuilder, public alertCtrl: AlertController, private rt: RtProvider, public loadingCtrl: LoadingController) {
    this.rt.getCountries().then(res => {
      console.log(res)
      this.countries = res
    })
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad NewAddressPage');
  }
  usMatchStateValidator(form: FormControl) {
    if (!form) return;
    if (form && form.get('country').value == 'US') {
        return form.get('state').value ? null : { 'required': true };
    } else {
        return
    }
}

  ionViewWillEnter() {

  }

  addAddress(address) {

    console.log(address)

    let loading = this.loadingCtrl.create({
      content: 'Saving ...',
      spinner: 'dots'
    })
    loading.present()

    this.rt.addAddress(address).then(result => {
      console.log(result)
      this.events.publish('address:reload', result);
      loading.dismiss()
      this.navCtrl.pop()
    },
    err =>{
      console.log(err)
      loading.dismiss()
      let alert = this.alertCtrl.create({
        title: 'REELTRAIL',
        subTitle: 'There was an error saving the address, please verify the address and try again',
        buttons: ['OK']
      })
      alert.present()
    })



  //   this.client.validateAddress(address).then(res => {
  //
  //     address.shippoId = res.address.address.shippoId
  //
  //     this.client.saveAddress( address ).then(res=>{
  //         //address saved!!
  //         loading.dismiss()
  //         this.navCtrl.pop()
  //     },
  //     err=>{
  //       //error saving
  //       loading.dismiss()
  //       let alert = this.alertCtrl.create({
  //         title: 'REELTRAIL',
  //         subTitle: 'There was an error saving the address, please try again later.',
  //         buttons: ['OK']
  //       })
  //       alert.present()
  //     })
  //
  //   },
  //   err => {
  //     //validate error
  //     loading.dismiss()
  //     let alert = this.alertCtrl.create({
  //       title: 'REELTRAIL',
  //       subTitle: 'There was an error validating the address, please verify and try again.',
  //       buttons: ['OK']
  //     })
  //     alert.present()
  //   })
  //
  }

}
