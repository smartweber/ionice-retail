import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ImagePicker } from '@ionic-native/image-picker';
import { FormBuilder, Validators } from '@angular/forms';
import { Validator } from '../../providers/validators/validators';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { File } from '@ionic-native/file';
/**
 * Generated class for the ClaimPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-claim',
  templateUrl: 'claim.html',
})
export class ClaimPage {

  public claimForm = this.fb.group({
    item: ['', Validators.required],
    order_id: ['', Validators.required],
    saleId: ['', Validators.required],
    problemType: ['', Validators.required],
    description: ['', Validators.required],
    email: ['', Validators.compose([Validators.required, Validators.email])],
    profileImage: ['']
  });
  aSOpts = {
    title: 'Choose Problem Type',
    subTitle: ''
  }
  order_id: string = '';
  item: any = {};
  constructor(private file: File, public navCtrl: NavController, public navParams: NavParams, private imagePicker: ImagePicker, private client: ClientProvider, private rt: RtProvider, public fb: FormBuilder, private val: Validator, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
    
    this.order_id = this.navParams.get("order_id")
    this.item = this.navParams.get("item")
    console.log(this.item);
  }

  ionViewDidLoad() {

  }

  ionViewWillEnter() {

    this.reload()
  }

  reload() {
    let profile = this.rt.getUser();
    this.claimForm.patchValue({ email: profile.email })
    this.claimForm.patchValue({ order_id: this.order_id })
    this.claimForm.patchValue({ saleId: this.item.ref_gear_id })

  }

  submit(claim) {

    let loading = this.loadingCtrl.create({
      content: 'Submitting claim ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.claim(claim).then(result => {
      loading.dismiss();
      let alert = this.alertCtrl.create({
        title: 'REELTRAIL',
        subTitle: 'Your claim was submitted successfully!',
        buttons: ['OK']
      })
      alert.present()
      this.navCtrl.pop()
    },
      err => {
        loading.dismiss()
        let alert = this.alertCtrl.create({
          title: 'REELTRAIL',
          subTitle: 'There was an error submitting your claim.',
          buttons: ['OK']
        })
        alert.present()
      })

  }
  goTo(page) {
    this.navCtrl.push(page)
  }

}
