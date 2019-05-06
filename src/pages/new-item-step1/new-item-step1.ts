/**
 * @Author: Ruben
 * @Date:   2017-11-04T02:16:06-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-08T23:06:58-07:00
 */



import { Component, ViewChild } from '@angular/core';
import { IonicPage,ToastController, NavController, NavParams, AlertController, LoadingController, Slides, Platform, PopoverController, ViewController } from 'ionic-angular';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { ImagePicker } from '@ionic-native/image-picker';
import { Camera, CameraOptions } from '@ionic-native/camera';

/**
 * Generated class for the NewItemStep1Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-new-item-step1',
  templateUrl: 'new-item-step1.html',
})
export class NewItemStep1Page {
  
  thumbnail(img):string{
    if(img.public_id){
    return 'url(https://res.cloudinary.com/reeltrail-com/image/upload/'+this.thumbnailsize+'/v'+img.version+'/'+img.public_id+')';
    }else{
      return img.secure_url;
    }
  }
  thumbnailsize='c_fit,h_200,w_200';
  maxPhotos:number=16;
  public step1Form = this.fb.group({
    title: ['', Validators.required],
    mainCategory: ['', Validators.required],
    subcategory1: ['', Validators.required],
    subcategory2: ['', Validators.required],
    // images: [[{public_id: "a32lhitaj8jgwmylmrxb", version: 1521706928, url: "http://res.cloudinary.com/reeltrail-com/image/upload/v1521706928/a32lhitaj8jgwmylmrxb.jpg", secure_url: "https://res.cloudinary.com/reeltrail-com/image/upload/v1521706928/a32lhitaj8jgwmylmrxb.jpg"}], Validators.required]
    images: [[], Validators.required]
  });

  @ViewChild('fileEl') fileEl;
  @ViewChild(Slides) slides: Slides;

  catOpt1 = {
    title: 'Main Category',
    subTitle: 'Please choose a main category'
  }
  catOpt2 = {
    title: 'Sub Category',
    subTitle: 'Please choose a sub category'
  }
  catOpt3 = {
    title: 'Sub Sub Category',
    subTitle: 'Please choose a sub category'
  }

  mainCat: Array<any> = []
  subCat: Array<any> = []
  subSubCat: Array<any> = []

  categories: {
    main: string,
    sub: string,
    subsub: string
  } = {
      main: "",
      sub: "",
      subsub: "",
    }

  category: {
    level_1: {
      id?: string
      name?: string
    },
    level_2: {
      id?: string
      name?: string
    },
    level_3: {
      id?: string
      name?: string
    },
  } = { level_1: {}, level_2: {}, level_3: {} }

  oldData: any = null

  pageTitle: string = "NEW ITEM"

  isShowFooter: boolean = false;
  more: boolean = false;

  constructor(public platform: Platform, private toastCtrl: ToastController, public fb: FormBuilder, public navCtrl: NavController, public navParams: NavParams, private client: ClientProvider, private rt: RtProvider, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private imagePicker: ImagePicker, private camera: Camera, private popover: PopoverController) {
    this.oldData = this.navParams.get("data")
    console.log('oldData ', this.oldData)
  }
  get mobileWeb(){
    return (this.platform.is("core") || this.platform.is("mobileweb"))
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad NewItemStep1Page')

    console.log("data ", this.oldData)
    this.reset()
  }

  ionViewWillEnter() {

  }

  reset() {

    this.mainCat = []
    this.subCat = []
    this.subSubCat = []

    this.rt.getCategories().then(res => {
      this.mainCat = res
      console.log("got", this.mainCat)
      if (this.oldData) {

        this.pageTitle = "EDIT ITEM"

        this.step1Form.patchValue({ title: this.oldData.title })
        this.step1Form.patchValue({ mainCategory: this.oldData.category.level_1.id })
        this.categories.main = this.oldData.category.level_1.name
        this.mainChanged()
        this.step1Form.patchValue({ subcategory1: this.oldData.category.level_2.id })
        this.categories.sub = this.oldData.category.level_2.name
        this.subChanged()
        this.step1Form.patchValue({ subcategory2: this.oldData.category.level_3.id })
        this.categories.subsub = this.oldData.category.level_3.name
        this.step1Form.patchValue({ images: this.oldData.images })

        this.category = this.oldData.category

      } else if (localStorage.getItem("step1")) {

        // let cache = JSON.parse( localStorage.getItem("step1") )

        // this.step1Form.patchValue({ images : cache.images} )

      }
    },
      err => {

      })


  }

  mainChanged() {
    let mainCatId = this.step1Form.controls['mainCategory'].value
    this.step1Form.patchValue({ subcategory1: '' })
    this.step1Form.patchValue({ subcategory2: '' })
    this.subCat = []
    this.subSubCat = []

    let mainCategory = _.find(this.mainCat, { _id: mainCatId })
    this.categories.main = mainCategory.name
    this.subCat = mainCategory.subcategories

    this.category.level_1.id = mainCategory._id
    this.category.level_1.name = mainCategory.name

  }

  subChanged() {
    let mainCatId = this.step1Form.controls['mainCategory'].value
    let subCatId = this.step1Form.controls['subcategory1'].value
    this.step1Form.patchValue({ subcategory2: '' })
    this.subSubCat = []

    let mainCategory = _.find(this.mainCat, { _id: mainCatId })
    let subCategory = _.find(mainCategory.subcategories, { _id: subCatId })
    this.categories.sub = subCategory.name

    this.subSubCat = subCategory.subcategories

    this.category.level_2.id = subCategory._id
    this.category.level_2.name = subCategory.name
  }

  subSubChanged() {
    let mainCatId = this.step1Form.controls['mainCategory'].value
    let subCatId = this.step1Form.controls['subcategory1'].value
    let subSubCatId = this.step1Form.controls['subcategory2'].value

    let mainCategory = _.find(this.mainCat, { _id: mainCatId })
    let subCategory = _.find(mainCategory.subcategories, { _id: subCatId })
    let subSubCategory = _.find(subCategory.subcategories, { _id: subSubCatId })

    this.categories.subsub = subSubCategory.name

    this.category.level_3.id = subSubCategory._id
    this.category.level_3.name = subSubCategory.name


  }

  clearCache() {

    localStorage.removeItem('step1')
    localStorage.removeItem('step2')
    localStorage.removeItem('step3')
  }

  dismiss() {
    this.clearCache()
    this.navCtrl.parent.getActive().dismiss()
  }

  next(step1) {


    let data = {
      category: this.category,
      title: step1.title,
      images: step1.images
    }

    console.log("step1 ", step1)
    console.log("data ", data)
    localStorage.setItem("step1", JSON.stringify(step1))
    this.navCtrl.push("NewItemStep2Page", { data: data, oldData: this.oldData })
  }

  showFooter(){
    var imgs = this.step1Form.controls['images'].value;
    if(imgs.length>=this.maxPhotos){
      let toast = this.toastCtrl.create({
        message: `You can upload a maximum of ${this.maxPhotos} photos`,
        duration: 5000,
        position: 'top'
      });
      toast.present();
      return;
    }
    this.isShowFooter=true;
  }


  fileChange(ev) {    
    let fileList: FileList = ev.target.files
    let file: File = fileList[0]

    if (file) {

      let loading = this.loadingCtrl.create({
        content: 'Loading ...',
        spinner: 'dots'
      });

      loading.present()

      this.rt.uploadImageWeb(file).then(res => {
        loading.dismiss()
        var imgs = this.step1Form.controls['images'].value
        imgs.push(res.image)
        this.step1Form.patchValue({ images: imgs })
        console.log("images ", imgs)
        this.resetImageInput();

      },err=>{
        this.resetImageInput();
      })

      // this.client.uploadImageWeb(file).then(res => {
      //   loading.dismiss()
      //
      //   let url = res.url
      //   var imgs = this.step1Form.controls['images'].value
      //   imgs.push({ url: res.url })
      //   this.step1Form.patchValue({ images: imgs })
      //   console.log("images ", imgs)
      //
      // })
    }



  }
  resetImageInput() {
    this.isShowFooter = false;
    this.fileEl.nativeElement.value = "";
    setTimeout(() => {
      try{
      this.slides.update()
      this.slides.slideTo(this.slides.length()-1)
      }catch(e){}
    }, 100)
  }

  get images() {
    let images = this.step1Form.controls['images'].value
    return images
  }

  takePicture() {
    this.isShowFooter = false;
    if (this.mobileWeb) {
      this.fileEl.nativeElement.click()
      return;
    }
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true
    }

    this.camera.getPicture(options).then((imageUri) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:

      var arr = imageUri.split("/")
      var filename = arr.pop();
      var path = arr.join("/")
      let loading = this.loadingCtrl.create({
        content: 'Loading ...',
        spinner: 'dots'
      });

      console.log('images took ', imageUri, filename, path)

      loading.present()

      this.rt.uploadImage(filename, imageUri).then(res => {
        loading.dismiss()

        console.log('image upload result ', res)

        var imgs = this.step1Form.controls['images'].value
        imgs.push(res.image)
        this.step1Form.patchValue({ images: imgs })        

      },err=>{
        loading.dismiss()
      })

    }, (err) => {
      // Handle error
    });


  }

  delete(img) {

    var imgs = this.step1Form.controls['images'].value

    _.remove(imgs, (obj) => {
      if (obj.url == img.url)
        return true
      else
        return false
    })

    console.log('after images ', imgs)

    this.step1Form.patchValue({ images: imgs })

    setTimeout(() => {
      try{
      this.slides.update()
      this.slides.slideTo(0)
      }catch(e){}
    }, 100)
  }

  selectPicture() {

    this.isShowFooter = false;

    if (this.mobileWeb) {
      this.fileEl.nativeElement.click()
      return;
    }

    let options = {
      maximumImagesCount: 1,
      quality: 50
    }

    this.imagePicker.getPictures(options).then((results) => {
      for (var i = 0; i < results.length; i++) {

        var arr = results[i].split("/")
        var filename = arr.pop();
        var path = arr.join("/")
        let loading = this.loadingCtrl.create({
          content: 'Loading ...',
          spinner: 'dots'
        });

        loading.present()

        this.rt.uploadImage(filename, results[i]).then(res => {
          loading.dismiss()
          var imgs = this.step1Form.controls['images'].value
          imgs.push(res.image)
          this.step1Form.patchValue({ images: imgs })
          console.log("images ", imgs)

        })
      }
    }, (err) => { })


  }

  close() {
    this.isShowFooter = false;
  }
}