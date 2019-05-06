/**
 * @Author: Ruben
 * @Date:   2017-10-30T02:29:39-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-04T21:27:00-07:00
 */



import { Component } from '@angular/core';
import {NavController, NavParams  } from 'ionic-angular';

/**
 * Generated class for the ModalNavigationComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-navigation',
  templateUrl: 'modal-navigation.html'
})
export class ModalNavigationComponent {

  rootPage: any;
  data : any

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    console.log('Hello ModalNavigationComponent Component');

    let r = navParams.get('root')
    let data = navParams.get('data')



    if(r){
      this.rootPage = r
      this.data = {data : data}
    }
  }



}
