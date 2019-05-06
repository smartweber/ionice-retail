/**
 * @Author: Ruben
 * @Date:   2017-12-05T03:40:39-07:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-13T14:47:20-07:00
 */



import { Component } from '@angular/core';
import { IonicPage,Platform, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { Braintree, ApplePayOptions, PaymentUIOptions, PaymentUIResult } from '@ionic-native/braintree';


/**
 * Generated class for the ShippingLabelPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shipping-label',
  templateUrl: 'shipping-label.html',
})
export class ShippingLabelPage {

  carriers = [{ value: "fedex", name: "FedEx" }, { value: "usps", name: "USPS" }, { value: "ups", name: "UPS" }]
  parcelOption: string = '';
  public form = this.fb.group({
    carrier: ['', Validators.required],
    parcel: [''],
    height: ['', Validators.required],
    width: ['', Validators.required],
    length: ['', Validators.required],
    rate: ['', Validators.required],
    weight: ['', Validators.required]
  });

  carrierOpt = {
    title: 'Carrier',
    subTitle: 'Please select your carrier '
  }

  shipOpt = {
    title: 'Parcel',
    subTitle: 'Select a parcel'
  }

  serviceOpt = {
    title: 'Shipping Rate',
    subTitle: 'Select a rate '
  }

  parcels: any

  shippingOptions = []

  services: Array<any> = []

  processingFee: number = 0
  total: number = 0
  grandTotal: number = 0

  shippo: any

  options = {
    cssClass: 'customSelect'
  }

  order: any
  item: any
  shipment: any = [];
  dimensionShipment: any = [];


  constructor(public platform:Platform,public fb: FormBuilder, public navCtrl: NavController, public navParams: NavParams, private rt: RtProvider, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private braintree: Braintree) {

    this.order = navParams.get('order')
    this.item = navParams.get('item')

  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad ShippingLabelPage');

    this.reload()

  }

  updateTotal(amount) {
    this.total = parseFloat(amount)
    this.processingFee = (this.total * 0.0290) + 0.25
    this.grandTotal = this.total + this.processingFee
  }

  reload() {

    this.rt.getParcels().then(list => {
      this.parcels = list.parcels.results.filter(p => !!p.template)
      _.forEach(this.parcels, (parcel) => {
        parcel.carrier = parcel.template.split('_')[0].toLowerCase()
        parcel.name = parcel.template.split('_').slice(1).join(' ').replace(/([A-Z])/g, ' $1').trim() + ` (${Number(parcel.width).toFixed(2)}${parcel.distance_unit}x${Number(parcel.length).toFixed(2)}${parcel.distance_unit}x${Number(parcel.height).toFixed(2)}${parcel.distance_unit})`
      })
    },
      err => {

      })

  }

  carrierChanged() {

    if (this.parcelOption == 'dimensions') {
      return this.parcelMeasurementsChanged();
    } else {
      let ca = this.form.controls.carrier.value
      this.shippingOptions = [];
      let shippingOptions = _.filter(this.parcels, { carrier: ca });
      _.forEach(shippingOptions, (parcel) => {
        let opt = this.shippingOptions.find(p => p.width == parcel.width && p.height == parcel.height && p.length == parcel.length && p.weight == parcel.weight);
        if (!opt)
          this.shippingOptions.push(parcel);
      })
    }
  }

  getDimentions(parcel) {
    return `${Number(parcel.width).toFixed(2)}${parcel.distance_unit} x ${Number(parcel.length).toFixed(2)}${parcel.distance_unit} x ${Number(parcel.height).toFixed(2)}${parcel.distance_unit}`
  }

  getWeight(parcel) {
    return `${Number(parcel.weight).toFixed(2)} ${parcel.mass_unit}`
  }

  get rates() {
    if (this.parcelOption == 'dimensions') {
      return _.filter(this.dimensionShipment.rates||[], { carrier: this.form.controls.carrier.value });
    } else {
      return this.shipment.rates||[];
    }
  }

  parcelChanged() {

    let parcel = this.form.controls.parcel.value
    this.form.controls.rate.setValue('');
    console.log("choosen ", parcel)


    let loading = this.loadingCtrl.create({
      content: '',
      spinner: 'dots'
    })
    loading.present()
    this.form.controls.weight.setValue(Number(parcel.weight).toFixed(2));
    this.form.controls.length.setValue(Number(parcel.length).toFixed(2));
    this.form.controls.height.setValue(Number(parcel.height).toFixed(2));
    this.form.controls.width.setValue(Number(parcel.width).toFixed(2));
    this.rt.createShipment(this.order.order_id, this.item._id, parcel.object_id).then(result => {
      loading.dismiss()
      console.log(result)
      this.shipment = result.shipment
    }, () => {
      loading.dismiss()
      let alert = this.alertCtrl.create({
        title: 'REELTRAIL',
        subTitle: 'There are no rates available at this moment for your section, please modify your selection and try again',
        buttons: ['OK']
      })
      alert.present()

    })
  }
  parcelMeasurementsChanged() {
    let form = this.form.value;
    form.order_id = this.order.order_id;
    form.line_item_id = this.item._id;
    if (form.height && form.width && form.length && form.weight) {
      this.form.controls.rate.setValue('');
      let loading = this.loadingCtrl.create({
        content: 'Loading rates...',
        spinner: 'dots'
      })
      loading.present();
      this.rt.shipmentRates(form).then(result => {
        loading.dismiss()
        console.log(result)
        this.dimensionShipment = result.shipment
        _.forEach(this.dimensionShipment.rates, (parcel) => {
          parcel.carrier = parcel.provider.toLowerCase()
        })
        console.log(this.dimensionShipment.rates)
      }, () => {
        loading.dismiss()
        let alert = this.alertCtrl.create({
          title: 'REELTRAIL',
          subTitle: 'There are no rates available at this moment for your section, please modify your selection and try again',
          buttons: ['OK']
        })
        alert.present()
      })
    }
  }

  rateChanged() {

    //let rate = this.form.controls.rate.value
    // this.updateTotal(serviceObj.amount)

  }


  buy(form) {

    // let loading = this.loadingCtrl.create({
    //   content: 'Processing Label',
    //   spinner: 'dots'
    // })
    // loading.present()

    console.log('buy label ', form)

    let loading = this.loadingCtrl.create({
      content: 'Loading ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.getBtToken().then(result => {

      let token = result.clientToken
      loading.dismiss()

      const paymentOptions: PaymentUIOptions = {
        amount: this.total.toFixed(2),
        primaryDescription: 'Premiun listing options',
      };
      const appleOptions: ApplePayOptions = {
        //displayName:'ReelTrail LLC',
        merchantId: 'merchant.reeltrail.llc.production',
        currency: 'USD',
        country: 'US'
      };

      this.braintree.initialize(token)
        .then(() => {
          this.braintree.setupApplePay(appleOptions).then(pay => { }, err => { console.log(err) })
          this.braintree.presentDropInPaymentUI(paymentOptions).then((result: PaymentUIResult) => {
            if (result.userCancelled) {
              console.log("User cancelled payment dialog.");
            } else {
              console.log("User successfully completed payment!");
              console.log("Payment Nonce: " + result.nonce);
              console.log("Payment Result.", result);

              let loading = this.loadingCtrl.create({
                content: 'Processing payment ...',
                spinner: 'dots'
              });

              loading.present()

              this.rt.purchaseShippingLabel(this.order.order_id, this.item._id, this.form.controls.rate.value, result.nonce, this.form.controls.carrier.value).then(result => {
                loading.dismiss()
                let alert = this.alertCtrl.create({
                  title: 'SUCCESS',
                  subTitle: 'Your shipping label was successfully created!',
                  buttons: ['OK']
                })
                alert.present()
                this.navCtrl.pop()

              },
                error => {
                  loading.dismiss()
                  let alert = this.alertCtrl.create({
                    title: 'REELTRAIL',
                    subTitle: 'There was an error generating the shiiping label, please try again later',
                    buttons: ['OK']
                  })
                  alert.present()
                })
            }
          },
            err => {
              console.log(err)
              loading.dismiss()
              let alert = this.alertCtrl.create({
                title: 'REELTRAIL',
                subTitle: 'There was an error adding your payment method, please verify that its valid.',
                buttons: ['OK']
              })
              alert.present()
            })
        },
          err => {
            let alert = this.alertCtrl.create({
              title: 'REELTRAIL',
              subTitle: 'There was an error, please try again later',
              buttons: ['OK']
            })
            alert.present()
            console.log(err)
          })
    }, err => {
      let alert = this.alertCtrl.create({
        title: 'REELTRAIL',
        subTitle: 'There was an error, please try again later',
        buttons: ['OK']
      })
      alert.present()
      console.log(err)
    })


  }

}
