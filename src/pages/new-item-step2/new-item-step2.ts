/**
 * @Author: Ruben
 * @Date:   2017-11-04T02:16:15-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-09T15:54:44-07:00
 */



import { Component } from '@angular/core';
import { IonicPage,Platform, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { Validator } from '../../providers/validators/validators';

/**
 * Generated class for the NewItemstep2Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-new-item-step2',
  templateUrl: 'new-item-step2.html',
})
export class NewItemStep2Page {

  public step2Form = this.fb.group({
    price: ['',Validators.compose([Validators.required,Validators.pattern(/^\d*(.\d{0,2})?$/)])],
    isFreeShipping: [false, Validators.required],
    shippingFee: ['' ,Validators.required],
    stock: [1, Validators.required],
    condition: ['New', Validators.required],
    conditionDetails: [''],
    returns: [0],
    description: ['', Validators.required],
  });

  title: string = ""
  category: string = ""
  prevData: any = null
  oldData : any = null

  conditionOpt  = {
    title: 'Condition',
    subTitle: 'Please choose what best describe the item.'
  }

  policyOpts  = {
    title: 'Return Policy',
    subTitle: 'Please select a return period.'
  }

  pageTitle : string = "NEW ITEM"

  constructor(public platform:Platform,public fb: FormBuilder, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {
    this.prevData = navParams.get("data")||{}
    this.oldData = navParams.get("oldData")
    console.log('oldData ', this.oldData)

  }
  get formValid(){
    return !((this.step2Form.controls['price'].errors && this.step2Form.controls['price'].errors.required) || 
          (this.step2Form.controls['shippingFee'].errors && this.step2Form.controls['shippingFee'].errors.required) || 
          (this.step2Form.controls['isFreeShipping'].errors && this.step2Form.controls['isFreeShipping'].errors.required) || 
          (this.step2Form.controls['stock'].errors && this.step2Form.controls['stock'].errors.required) || 
          (this.step2Form.controls['description'].errors && this.step2Form.controls['description'].errors.required))
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad NewItemstep2Page');
    this.title = this.prevData.title
    //this.category = this.prevData.category.level_1.name + ">" + this.prevData.category.level_2.name + ">" + this.prevData.category.level_3.name

    if(this.oldData){
      this.pageTitle = "EDIT ITEM"
      this.step2Form.patchValue({ condition : this.oldData.condition} )
      this.step2Form.patchValue({ conditionDetails : this.oldData.conditionDetails} )
      this.step2Form.patchValue({ description : this.oldData.description} )
      this.step2Form.patchValue({ price : this.oldData.price} )
      if(this.oldData.shippingFee > 0){
        this.step2Form.patchValue({ isFreeShipping : false} )
      }
      else{
        this.step2Form.patchValue({ isFreeShipping : true} )
      }

      this.step2Form.patchValue({ shippingFee : this.oldData.shippingFee} )
      this.step2Form.patchValue({ inStock : this.oldData.stock} )
      this.step2Form.patchValue({ returns : this.oldData.returns} )

      console.log("set ", this.step2Form)

    }
    else if ( localStorage.getItem("step2") ){

      let cache = JSON.parse( localStorage.getItem("step2") )

      this.step2Form.patchValue({ condition : cache.condition} )
      this.step2Form.patchValue({ conditionDetails : cache.conditionDetails} )
      this.step2Form.patchValue({ description : cache.description} )
      this.step2Form.patchValue({ ourPrice : cache.ourPrice } )
      this.step2Form.patchValue({ isFreeShipping : cache.isFreeShipping} )
      this.step2Form.patchValue({ flatShippingRate : cache.flatShippingRate} )
      this.step2Form.patchValue({ inStock : cache.inStock} )
      this.step2Form.patchValue({ returnPolicy : cache.returnPolicy} )

    }
  }

  conditionChanged(){

  }

  updatedShipping(){
    if(this.step2Form.controls['isFreeShipping'].value){
      this.step2Form.patchValue({shippingFee:0})
    }
    else{
      this.step2Form.patchValue({shippingFee:''})
    }
  }

  next(form2){

    if(Number(form2.price) == 0){

      let alert = this.alertCtrl.create({
        title: 'REELTRAIL',
        subTitle: 'The price of the gear your are trying to sell must be greater than $0.00',
        buttons: ['OK']
      })
      alert.present()
      return

    }

    let data = _.merge(_.omit(form2, ['isFreeShipping']), this.prevData)

    localStorage.setItem("step2", JSON.stringify( form2 ))

    data.price = Number(Number(data.price||0).toFixed(2))

    console.log("data ", data)

    this.navCtrl.push("NewItemStep3Page", {data:data, oldData : this.oldData})

  }

  goBack() {
    this.navCtrl.pop();
  }
}
