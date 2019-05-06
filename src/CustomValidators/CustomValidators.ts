import { Injectable, NgZone } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import _ from 'lodash';
import {ClientProvider} from '../providers/client/client';


export class CustomValidators {

  static client: ClientProvider;
  static zone: NgZone;

  constructor(c : ClientProvider, z : NgZone)
  {
    CustomValidators.client = c
    CustomValidators.zone = z

  }


  usernameCheck (input: FormControl) {


    // CustomValidators.zone.run(() => {

      if (!input.value ) {
       return Promise.resolve({ invalid: true });
     }

      var uError : any = null
      let data = {
        username : input.value
      }

      return CustomValidators.client.checkUsername(data).then(data => data, err => err )


    // })




    // Validator.clientService.checkUsername(data).then(res=> {
    //   return {usernameTaken : true}
    // },
    // err=>{
    //     uError = {usernameTaken : true}
    //     return uError
    // })


  }



}
