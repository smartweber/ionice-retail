import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController   } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import {ClientProvider} from '../../providers/client/client';
import {RtProvider} from '../../providers/rt/rt';
import * as _ from 'lodash';
import * as moment from 'moment'
/**
 * Generated class for the SellerSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-seller-settings',
  templateUrl: 'seller-settings.html',
})
export class SellerSettingsPage {

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

  dob : any
  userModel : any
  primaryAddress : any = {}
  updatingBankInfo : boolean = false
  bankLast4 : string = ""
  routingNumber : string = ""
  accountStatus : string = ""

  public bankForm = this.fb.group({
    routingNumber: ['', Validators.required],
    accountNumber: ['', Validators.required]
  });

  public addressForm = this.fb.group({
    street1: ['', Validators.required],
    state: ['', Validators.required],
    city: ['', Validators.required],
    country: ['US', Validators.required],
    zip: ['', Validators.compose([Validators.required, Validators.minLength(5)])]
  });

  account : any = null

  constructor(public navCtrl: NavController, public navParams: NavParams,  public fb: FormBuilder, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private rt : RtProvider) {
  }

  isEmpty(address){
    return _.isEmpty(address)
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad SellerSettingsPage');
  }

  ionViewWillEnter(){
    this.reload()
  }

  setAddress(){
    this.navCtrl.push("AddressesPage")
  }

  updateBank(){
    this.updatingBankInfo = true
    this.bankForm.patchValue({routingNumber:''})
    this.bankForm.patchValue({accountNumber:''})
  }

  reload(){
    this.updatingBankInfo = false
    let loading = this.loadingCtrl.create({
      content: 'Updating ...',
      spinner: 'dots'
    })
    loading.present()

    this.rt.getFunding().then(account =>{
      loading.dismiss()
      console.log(account)

      if(account.individual){

        this.dob = moment(account.individual.dateOfBirth , "YYYY-MM-DD").toISOString()
        this.addressForm.patchValue({street1 : account.individual.address.streetAddress})
        this.addressForm.patchValue({state : account.individual.address.region})
        this.addressForm.patchValue({city : account.individual.address.locality})
        this.addressForm.patchValue({zip : account.individual.address.postalCode})


      }

      if(account.funding){
        this.account = account
        this.bankLast4 = account.funding.accountNumberLast4
        this.routingNumber = account.funding.routingNumber
        this.accountStatus = account.status

      }


    },
    err => {
      loading.dismiss()
      this.updatingBankInfo = true
      console.log(err)
    })

  }



  save(bank){

    console.log("card" , bank)

    let loading = this.loadingCtrl.create({
      content: 'Updating ...',
      spinner: 'dots'
    })
    loading.present()

    var bankAccount = {
        dateOfBirth: moment(this.dob).format('YYYYMMDD'),
        city:this.addressForm.get('city').value,
        state:this.addressForm.get('state').value,
        zip:this.addressForm.get('zip').value,
        street1:this.addressForm.get('street1').value,
        destination:"bank",
        routingNumber:this.bankForm.get('routingNumber').value,
        accountNumber:this.bankForm.get('accountNumber').value
    }

    console.log("account ", bankAccount)

    if(this.account){
      this.rt.updateBankFunding(bankAccount).then(result =>{
        console.log(result)
        loading.dismiss()
        let alert = this.alertCtrl.create({
          title: 'REELTRAIL',
          subTitle: 'You bank account information was updated successfully',
          buttons: ['OK']
        })
        alert.present()
        this.navCtrl.pop()
      },
      err => {
        loading.dismiss()
        let alert = this.alertCtrl.create({
          title: 'REELTRAIL',
          subTitle: 'There was a problem updating your bank information, please verify that your routing and account numbers.',
          buttons: ['OK']
        })
        alert.present()
      })
    }
    else {
      this.rt.addBankFunding(bankAccount).then(result =>{
        console.log(result)
        loading.dismiss()
        let alert = this.alertCtrl.create({
          title: 'REELTRAIL',
          subTitle: 'You bank account information was updated successfully',
          buttons: ['OK']
        })
        alert.present()
        this.navCtrl.pop()
      },
      err =>{
        loading.dismiss()
        let alert = this.alertCtrl.create({
          title: 'REELTRAIL',
          subTitle: 'There was a problem updating your bank information, please verify that your routing and account numbers.',
          buttons: ['OK']
        })
        alert.present()
      })
    }

  }

}
