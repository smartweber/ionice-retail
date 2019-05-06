/**
 * @Author: Ruben
 * @Date:   2017-11-04T02:19:17-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-08T23:41:15-07:00
 */



import { Component , ViewChild, ElementRef} from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform, LoadingController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';

declare var google;
/**
 * Generated class for the NewAdvstep2Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-new-adv-step2',
  templateUrl: 'new-adv-step2.html',
})
export class NewAdvStep2Page {

  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('auto') autoInput: ElementRef;
  map: any;
  autocompleteService : any
  placesService : any
  autocompleteText : string
  get formValid(){
    return !((this.step2Form.controls['price'].errors && this.step2Form.controls['price'].errors.required) || 
          (this.step2Form.controls['intensity'].errors && this.step2Form.controls['intensity'].errors.required) || 
          (this.step2Form.controls['listingDays'].errors && this.step2Form.controls['listingDays'].errors.required) || 
          (this.step2Form.controls['isGroup'].errors && this.step2Form.controls['isGroup'].errors.required) || 
          (this.step2Form.controls['intensity'].errors && this.step2Form.controls['intensity'].errors.required) || 
          (this.step2Form.controls['location'].errors && this.step2Form.controls['location'].errors.required) || 
          (this.step2Form.controls['description'].errors && this.step2Form.controls['description'].errors.required))
  }

  public step2Form = this.fb.group({
    price: ['', Validators.required],
    duration: ['', Validators.required],
    listingDays : ['', Validators.required],
    isGroup : [false , Validators.required],
    groupSizeMin : [1],
    groupSizeMax: [1],
    intensity: ['', Validators.required],
    youtubelink : [''],
    description: ['', Validators.required],
    location : ['', Validators.required],
    autocompleteText : ['']

  });

  prevData: any = null
  title: string = ""
  category: string = ""
  placeholder : string = "Set your location (required)"
  predictions : Array<any> = []

  intOpts  = {
    title: 'Intensity',
    subTitle: 'Please select intensity in terms of difficulty and/or intensity.'
  }

  oldData : any

  pageTitle: string = "NEW ADVENTURE"

  constructor(public platform: Platform,public fb: FormBuilder, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {
    this.prevData = navParams.get("data")
    this.oldData = this.navParams.get("oldData")
    this.title = this.prevData.title
    this.category = this.prevData.category.level_1.name + ">" + this.prevData.category.level_2.name + ">" + this.prevData.category.level_3.name

  }

  loadMap(){
    var latLng = new google.maps.LatLng(-34.9290, 138.6010);

    if(this.oldData){
      latLng = new google.maps.LatLng(this.oldData.location.lat+"", this.oldData.location.lng+"");

      console.log('loading map ', latLng , this.oldData.location  )
    }
    else if(localStorage.getItem("step2")){
      let cache = JSON.parse( localStorage.getItem("step2") )
      latLng = new google.maps.LatLng(cache.location.lat, cache.location.lng);
    }


    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions)

    this.autocompleteService =  new google.maps.places.AutocompleteService()
    this.placesService =  new google.maps.places.PlacesService(this.map)

  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad NewAdvstep2Page');

    if(this.oldData){
      this.pageTitle = "EDIT ADVENTURE"
      this.step2Form.patchValue({ price : this.oldData.price} )
      this.step2Form.patchValue({ duration : this.oldData.duration} )
      this.step2Form.patchValue({ listingDays : this.oldData.listingDays} )

      if(this.oldData.group){
        this.step2Form.patchValue({ isGroup : true} )
        this.step2Form.patchValue({ groupSizeMin : this.oldData.group.min} )
        this.step2Form.patchValue({ groupSizeMax : this.oldData.group.max} )
      }
      else{
        this.step2Form.patchValue({ isGroup : false} )
        this.step2Form.patchValue({ groupSizeMin : 1} )
        this.step2Form.patchValue({ groupSizeMax : 1} )
      }


      this.step2Form.patchValue({ intensity : this.oldData.intensity} )
      this.step2Form.patchValue({ youtubelink : this.oldData.youtubelink} )
      this.step2Form.patchValue({ description : this.oldData.description} )
      this.step2Form.patchValue({ location : this.oldData.location} )
      this.step2Form.patchValue({ autocompleteText : this.oldData.location.address} )

      console.log('step2Form ', this.step2Form)

    }
    else if ( localStorage.getItem("step2") ){

      let cache = JSON.parse( localStorage.getItem("step2") )
      this.step2Form.patchValue({ price : cache.price} )
      this.step2Form.patchValue({ duration : cache.duration} )
      this.step2Form.patchValue({ listingDays : cache.listingDays} )
      this.step2Form.patchValue({ isGroup : cache.isGroup} )
      this.step2Form.patchValue({ groupSizeMin : cache.groupSizeMin} )
      this.step2Form.patchValue({ groupSizeMax : cache.groupSizeMax} )
      this.step2Form.patchValue({ intensity : cache.intensity} )
      this.step2Form.patchValue({ youtubelink : cache.youtubelink} )
      this.step2Form.patchValue({ description : cache.description} )
      this.step2Form.patchValue({ location : cache.location} )
      this.step2Form.patchValue({ autocompleteText : cache.autocompleteText} )


    }

    this.loadMap()
  }

  onInput($event) {

    let val = $event.target.value
    if(val.length > 0){
      var q = {
        input : val,
        types : ['geocode']
      }

      this.autocompleteService.getQueryPredictions(q , (res) =>{
        console.log("pred " ,res )
        this.predictions = res
      })

    }
    else{
      this.predictions = []
      this.step2Form.controls.autocompleteText.setValue("")
    }

  }

  onCancel($event) {

    this.predictions = []
  }

  detail(event){

    console.log("location ",event )

    this.placesService.getDetails({placeId : event.place_id}, (details, status)=>{

      console.log("details ", details , status)

      let geo = details.geometry.location

      let mapOptions = {
        center: geo,
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      console.log("geo ", geo)

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.placeholder = details.formatted_address
      this.step2Form.controls.autocompleteText.setValue("")

      let loc = {
        address: details.formatted_address,
    		lat: geo.lat(),
    		lng: geo.lng()
      }

      this.step2Form.patchValue({location : loc})

      this.predictions = []

    })

  }


  next(form2){

    // let data = _.merge(this.prevData , form2)


    var data = this.prevData

    if(this.step2Form.controls.isGroup.value){
      data.group = {
        min: Number(this.step2Form.controls.groupSizeMin.value),
        max: Number(this.step2Form.controls.groupSizeMax.value)
      }
    }


     data.price = Number(this.step2Form.controls.price.value),
     data.description = this.step2Form.controls.description.value,
     data.intensity = Number(this.step2Form.controls.intensity.value),
     data.duration = Number(this.step2Form.controls.duration.value),
     data.youtubelink = this.step2Form.controls.youtubelink.value
     data.location = this.step2Form.controls.location.value
     data.listingDays = Number(this.step2Form.controls.listingDays.value)

    // data.groupSizeMin = 1

    console.log("sofar ", data)
    localStorage.setItem("step2", JSON.stringify( form2 ))
    this.navCtrl.push("NewAdvStep3Page", {data:data, oldData : this.oldData})
  }

  goBack() {
    this.navCtrl.pop();
  }
}
