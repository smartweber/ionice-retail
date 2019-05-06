/**
 * @Author: Ruben
 * @Date:   2017-11-02T01:23:39-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-18T14:58:14-07:00
 */



import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { FormBuilder, Validators } from '@angular/forms';
import { CardIO } from '@ionic-native/card-io';
import * as moment from 'moment';


/**
 * Generated class for the NewPaymentMethodPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-new-payment-method',
  templateUrl: 'new-payment-method.html',
})
export class NewPaymentMethodPage {

  public cardForm = this.fb.group({
    nickname: ['', Validators.required],
    number: ['', Validators.required],
    cvv: ['', Validators.required],
    expirationDate: ['', Validators.required],
    postalCode: ['', Validators.required]
  });

  maxDate: string = moment().add(5, 'years').format('YYYY-MM-DD')
  minDate: string = moment().format('YYYY-MM-DD')

  constructor(public navCtrl: NavController, public navParams: NavParams, public fb: FormBuilder, public alertCtrl: AlertController, private client: ClientProvider, public loadingCtrl: LoadingController, private cardIO: CardIO) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad NewPaymentMethodPage', this.maxDate);
  }

  scan() {
    this.cardIO.canScan()
      .then(
      (res: boolean) => {
        if (res) {
          let options = {
            requireExpiry: true,
            requireCVV: false,
            requirePostalCode: false
          };
          this.cardIO.scan(options).then(res => {
            console.log(res)

            if(res.cardNumber){
              this.cardForm.patchValue({number : res.cardNumber})
            }

            // if(res.expiryMonth && res.expiryYear){

            let exp =  res.expiryYear + "-" + res.expiryMonth

            console.log("expiration date ", exp)

            this.cardForm.patchValue({expirationDate : exp })
            // }


          })
        }
      }
      );
  }

  addCard(card) {

    card.expirationYear = card.expirationDate.split('-')[0]
    card.expirationMonth = card.expirationDate.split('-')[1]

    console.log(card)

    let loading = this.loadingCtrl.create({
      content: 'Saving ...',
      spinner: 'dots'
    });

    loading.present()
    this.client.savePaymentMethod(card).then(res => {
      loading.dismiss()
      this.navCtrl.pop()
    },
      err => {
        loading.dismiss()
        let alert = this.alertCtrl.create({
          title: 'REELTRAIL',
          subTitle: 'There was an error validating your card, please check that your card information its correct and try again.',
          buttons: ['OK']
        })
        alert.present()
      })

  }

}
