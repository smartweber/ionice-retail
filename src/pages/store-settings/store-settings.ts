import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { RtProvider } from '../../providers/rt/rt';
import * as moment from 'moment'

/**
 * Generated class for the StoreSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-store-settings',
  templateUrl: 'store-settings.html',
})
export class StoreSettingsPage {

  isVenmo: boolean = false
  email: boolean = false
  destination: string = '';
  mobilePhone: boolean = false
  direct: boolean = false
  paypal: boolean = false
  dob: any
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

  public addressForm = this.fb.group({
    street1: ['', Validators.required],
    state: ['', Validators.required],
    city: ['', Validators.required],
    country: ['US', Validators.required],
    zip: ['', Validators.compose([Validators.required, Validators.minLength(5)])]
  });
  public bankForm = this.fb.group({
    routingNumber: [''],
    accountNumber: [''],
    destination: ['', Validators.compose([Validators.required])],
    venmo_email: ['', Validators.email],
    paypal: ['', Validators.email],
    mobilePhone: ['']
  });

  public paypalForm = this.fb.group({
    paypalEmail: ['', Validators.compose([Validators.required, Validators.email])]
  });

  account: any = null
  updatingBankInfo: boolean = false

  constructor(public navCtrl: NavController, public navParams: NavParams, public fb: FormBuilder, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private rt: RtProvider) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad StoreSettingsPage');
  }

  ionViewWillEnter() {
    this.reload()
  }

  fundingChanged(type) {
    switch (type) {
      case 'paypal':
        this.destination = 'paypal';
        break;
      case 'direct':
        this.destination = 'direct';
        break;
    }

  }

  reload() {
    this.updatingBankInfo = false
    let loading = this.loadingCtrl.create({
      content: '',
      spinner: 'dots'
    })
    loading.present()

    this.rt.getFunding().then(account => {
      loading.dismiss()
      if (account.individual && account.individual.address) {
        this.dob = moment(account.individual.dateOfBirth, "YYYY-MM-DD").toISOString()
        this.addressForm.patchValue({ street1: account.individual.address.streetAddress })
        this.addressForm.patchValue({ state: account.individual.address.region })
        this.addressForm.patchValue({ city: account.individual.address.locality })
        this.addressForm.patchValue({ zip: account.individual.address.postalCode })
      }
      if (account.funding) {
        this.account = account
        this.bankForm.controls['destination'].setValue(account.funding.destination);
        if (account.funding.destination == 'bank') {
          this.fundingChanged('direct');
        }
        else if (account.funding.destination == 'mobile_phone' || account.funding.destination == 'email') {
          account.funding.venmo_email = account.funding.email;
          this.fundingChanged('direct');
          this.bankForm.controls['mobilePhone'].setValue(account.funding.mobilePhone)
          this.bankForm.controls['venmo_email'].setValue(account.funding.email)
          this.bankForm.controls['destination'].setValue(account.funding.destination)
        }
        else if (account.funding.destination == 'paypal') {
          this.paypalForm.patchValue({ paypalEmail: account.funding.email })
          this.fundingChanged('paypal')
        }
      }
    },
      err => {
        loading.dismiss()
        this.updatingBankInfo = true;
        try {
          let account = err.json();
          if (account.individual && account.individual.address) {
            this.dob = moment(account.individual.dateOfBirth, "YYYY-MM-DD").toISOString()
            this.addressForm.patchValue({ street1: account.individual.address.streetAddress })
            this.addressForm.patchValue({ state: account.individual.address.region })
            this.addressForm.patchValue({ city: account.individual.address.locality })
            this.addressForm.patchValue({ zip: account.individual.address.postalCode })
          }
        } catch (e) { }
      })

  }

  updateBank() {
    this.updatingBankInfo = true
    this.bankForm.patchValue({ routingNumber: '' })
    this.bankForm.patchValue({ accountNumber: '' })
  }
  cancel() {
    this.updatingBankInfo = false;
    this.bankForm.patchValue({ 'destination': this.account.funding.destination });
    this.destination = this.account.funding.destination;
  }

  get bankFormValid() {
    if (
      (!this.dob || !this.addressForm.value.zip || !this.addressForm.value.state || !this.addressForm.value.street1 || !this.addressForm.value.city) ||
      (this.bankForm.value.destination == 'bank' && (this.bankForm.value.accountNumber == '' || this.bankForm.value.routingNumber == '')) ||
      (this.bankForm.value.destination == 'email' && (this.bankForm.value.venmo_email == '' || this.bankForm.controls['venmo_email'].errors)) ||
      (this.bankForm.value.destination == 'mobile_phone' && this.bankForm.value.mobilePhone == '') ||
      (this.bankForm.value.destination == 'paypal' && this.bankForm.value.paypal == '')) {
      return false
    } else {
      return true;
    }
  }
  venmo($event = undefined) {
    this.bankForm.controls['destination'].setValue(this.isVenmo);
  }

  save(bank) {
    if (this.bankFormValid) {
      let loading = this.loadingCtrl.create({
        content: '',
        spinner: 'dots'
      })
      loading.present()

      var bankAccount = {
        dateOfBirth: moment(this.dob).format('YYYYMMDD'),
        city: this.addressForm.get('city').value,
        state: this.addressForm.get('state').value,
        zip: this.addressForm.get('zip').value,
        street1: this.addressForm.get('street1').value,
        destination: this.bankForm.get('destination').value,
        mobilePhone: this.bankForm.get('destination').value == 'mobile_phone' ? this.bankForm.get('mobilePhone').value : undefined,
        venmo_email: this.bankForm.get('destination').value == 'email' ? this.bankForm.get('venmo_email').value : undefined,
        routingNumber: this.bankForm.get('destination').value == 'bank' ? this.bankForm.get('routingNumber').value : undefined,
        accountNumber: this.bankForm.get('destination').value == 'bank' ? this.bankForm.get('accountNumber').value : undefined
      }
      if (this.account) {
        this.rt.updateBankFunding(bankAccount).then(result => {
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
        this.rt.addBankFunding(bankAccount).then(result => {
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
    } else {
      let alert = this.alertCtrl.create({
        title: 'REELTRAIL',
        subTitle: 'Please provide all the required information.',
        buttons: ['OK']
      })
      alert.present()
    }

  }

  usePaypal(form) {
    var paypal = {
      dateOfBirth: moment(this.dob).format('YYYYMMDD'),
      city: this.addressForm.get('city').value,
      state: this.addressForm.get('state').value,
      zip: this.addressForm.get('zip').value,
      street1: this.addressForm.get('street1').value,
      destination: "paypal",
      paypal: form.paypalEmail
    }

    let loading = this.loadingCtrl.create({
      content: '',
      spinner: 'dots'
    })
    loading.present()

    if (this.account) {
      this.rt.updateToUsePaypalFunding(paypal).then(result => {
        loading.dismiss()
        let alert = this.alertCtrl.create({
          title: 'REELTRAIL',
          subTitle: 'You are now using PayPal as your funding destination',
          buttons: ['OK']
        })
        alert.present()
        this.navCtrl.pop()
      },
        err => {
          loading.dismiss()
          let alert = this.alertCtrl.create({
            title: 'REELTRAIL',
            subTitle: 'There was a problem updating your funding to use paypal.',
            buttons: ['OK']
          })
          alert.present()
        })
    }
    else {
      this.rt.addPaypalFunding(paypal).then(result => {
        loading.dismiss()
        let alert = this.alertCtrl.create({
          title: 'REELTRAIL',
          subTitle: 'You are now using PayPal as your funding destination.',
          buttons: ['OK']
        })
        alert.present()
        this.navCtrl.pop()
      },
        err => {
          loading.dismiss()
          let alert = this.alertCtrl.create({
            title: 'REELTRAIL',
            subTitle: 'There was an issue setting your PayPal as funding destination.',
            buttons: ['OK']
          })
          alert.present()
        })
    }


  }

}
