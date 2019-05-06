/**
 * @Author: Ruben
 * @Date:   2017-11-04T02:16:19-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-09T15:55:56-07:00
 */



import { Component } from '@angular/core';
import { IonicPage,Platform, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { Validator } from '../../providers/validators/validators';

/**
 * Generated class for the NewItemstep3Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-new-item-step3',
  templateUrl: 'new-item-step3.html'
})
export class NewItemStep3Page {

  public step3Form = this.fb.group({
    originalPrice: [''],
    isAcceptingOffers: [false],
    lowestOffer: [0, Validators.min(0)],
    sku: [''],
    youtubelink: [''],
    handcrafted: [false],
    countryOfManufacture: ['US']
  });

  title: string = ""
  category: string = ""
  prevData: any = null
  oldData : any = null
  countries : Array<any> = []

  countryOpt  = {
    title: 'Country',
    subTitle: 'Please select the country of manufacture.'
  }

  pageTitle : string = "NEW ITEM"
  get formValid(){
    return !((this.step3Form.controls['originalPrice'].errors && this.step3Form.controls['originalPrice'].errors.required) || 
          (this.step3Form.controls['lowestOffer'].errors && this.step3Form.controls['lowestOffer'].errors.min))
  }

  constructor(public platform:Platform,public fb: FormBuilder, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {
    this.prevData = navParams.get("data")
    this.oldData = navParams.get("oldData")

    console.log('oldData ', this.oldData)
  }

  ionViewDidLoad() {

    //console.log('ionViewDidLoad NewItemstep3Page');
    this.title = this.prevData.title
    this.category = this.prevData.category.level_1.name + ">" + this.prevData.category.level_2.name + ">" + this.prevData.category.level_3.name

    this.rt.getCountries().then(res => {

      console.log(res)
      this.countries = res

      if(this.oldData){
        this.pageTitle = "EDIT ITEM"
        this.step3Form.patchValue({ countryOfManufacture : this.oldData.countryOfManufacture} )
        this.step3Form.patchValue({ youtubelink : this.oldData.youtubelink} )
        this.step3Form.patchValue({ handcrafted : this.oldData.handcrafted })
        this.step3Form.patchValue({ originalPrice : this.oldData.originalPrice} )



        if(this.oldData.offers){
          this.step3Form.patchValue({ isAcceptingOffers : true} )
          this.step3Form.patchValue({ lowestOffer : this.oldData.offers.lowest} )
        }
        else{
          this.step3Form.patchValue({ isAcceptingOffers : false} )
          this.step3Form.patchValue({ lowestOffer : ''} )
        }

        this.step3Form.patchValue({ sku : this.oldData.sku} )

        console.log("set ", this.step3Form)

      }
      else if ( localStorage.getItem("step3") ){

        let cache = JSON.parse( localStorage.getItem("step3") )

        this.step3Form.patchValue({ countryOfManufacture : cache.countryOfManufacture} )
        this.step3Form.patchValue({ youtubelink : cache.youtubelink} )
        this.step3Form.patchValue({ isHandcrafted : cache.isHandcrafted} )
        this.step3Form.patchValue({ originalPrice : cache.originalPrice } )
        this.step3Form.patchValue({ isAcceptingOffers : cache.isAcceptingOffers} )
        this.step3Form.patchValue({ lowestOffer : cache.lowestOffer} )
        this.step3Form.patchValue({ sku : cache.sku} )

      }
    })
  }

  next(form3){
    console.log('form3 ', form3)
    let data = _.merge(_.omit(form3, ['isAcceptingOffers','lowestOffer' ]), this.prevData)


    // data.originalPrice = (data.originalPrice == '') ? data.ourPrice : parseFloat(data.originalPrice)

    if(form3.isAcceptingOffers){
      data.offers = {}
      data.offers.lowest = form3.lowestOffer
    }

    data.originalPrice = Number(Number(data.originalPrice).toFixed(2))

    console.log("data ", data )

    localStorage.setItem("step3", JSON.stringify( form3 ))

    this.navCtrl.push("NewItemStep4Page", {data:data, oldData:this.oldData})
  }

  changeLowestOffer(event) {
    if (parseInt(this.step3Form.value.lowestOffer) > parseInt(this.step3Form.value.ourPrice)) {
      this.step3Form.patchValue({ lowestOffer : this.step3Form.value.ourPrice - 0.1} );
    }
  }

  goBack() {
    this.navCtrl.pop();
  }
}
