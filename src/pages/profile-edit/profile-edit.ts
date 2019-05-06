import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ImagePicker } from '@ionic-native/image-picker';
import { FormBuilder, Validators } from '@angular/forms';
import { Validator } from '../../providers/validators/validators';
import { ClientProvider } from '../../providers/client/client';
import { RtProvider } from '../../providers/rt/rt';
import { File } from '@ionic-native/file';

/**
 * Generated class for the ProfileEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile-edit',
  templateUrl: 'profile-edit.html',
})
export class ProfileEditPage {

  profileImg: string = ''
  profile: any = {}


  public editForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    storeName: ['', Validators.required],
    profileImage: [''],
    newPass: [false],
    newPassword: [''],
    oldPassword: [''],
    confirmPassword: ['']
  });

  constructor(private file: File, public navCtrl: NavController, public navParams: NavParams, private imagePicker: ImagePicker, private client: ClientProvider, private rt: RtProvider, public fb: FormBuilder, private val: Validator, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {

  }

  ionViewWillEnter() {

    this.reload()
  }

  reload(){

    this.rt.getProfile().then( profile => {
      //console.log('profile ', profile)
      this.editForm.patchValue({ firstName: profile.user.firstName })
      this.editForm.patchValue({ lastName: profile.user.lastName })
      this.editForm.patchValue({ storeName: profile.user.storeName })
      this.editForm.patchValue({ profileImage: profile.user.profileImage})
      this.profileImg = profile.user.profileImage.url
      this.profile=profile
    })

  }

  changePicture() {

    let options = {
      maximumImagesCount: 1,
      quality: 50
    }

    this.imagePicker.getPictures(options).then((results) => {
      for (var i = 0; i < results.length; i++) {
        console.log('Image URI: ' + results[i]);

        var arr = results[i].split("/")
        var filename = arr.pop();
        var path = arr.join("/")
        console.log("dir ", filename, path)

        let loading = this.loadingCtrl.create({
          content: 'Changing ...',
          spinner: 'dots'
        });



        loading.present()

        this.rt.uploadImage(filename, results[i]).then(res => {

          loading.dismiss()
          console.log("changed ", res)
          this.profileImg = res.image.secure_url
          this.editForm.patchValue({ profileImage: res.image })
        })

      }
    }, (err) => { });

  }

  changeAddress() {

  }

  update(profile) {

    let loading = this.loadingCtrl.create({
      content: 'Updating ...',
      spinner: 'dots'
    });

    loading.present()

    this.rt.updateProfile(profile).then(result => {
      loading.dismiss()
      this.navCtrl.pop()
    },
    err =>{
      loading.dismiss()
      let alert = this.alertCtrl.create({
        title: 'REELTRAIL',
        subTitle: 'There was an error updating your profile.',
        buttons: ['OK']
      })
      alert.present()
    })

  }
  goTo(page) {
    this.navCtrl.push(page)
  }

}
