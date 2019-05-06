
import { Injectable, NgZone } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import _ from 'lodash';
import {ClientProvider} from '../client/client'


@Injectable()
export class Validator {

   static clientService: ClientProvider
   static ngZone : NgZone

   constructor(public http: HttpClient, public client : ClientProvider, public zone: NgZone)
   {
     Validator.clientService = client
     Validator.ngZone = zone
   }

   validateRegForm (form: FormControl){

     var cbError : any = null
     var pError : any = null
     var uError : any = null

     if(form.get('agreedToTerms').value != true){
       cbError = { checkboxRequired : true }
     }


     var result = {}

     _.assignIn(result, cbError)


     return result
   }

  passwordMatchValidator (g: FormControl) {

  return g.get('password').value === g.get('confirmPassword').value
     ? null : {'mismatch': true};
   }

  usernameCheck (input: FormControl) {

    Validator.ngZone.run(() => {
      if (!input.value ) {
       return Promise.resolve({ invalid: true });
     }

      var uError : any = null
      let data = {
        username : input.value
      }

      return Validator.clientService.checkUsername(data).then(data => data, err => err )

    });



    // Validator.clientService.checkUsername(data).then(res=> {
    //   return {usernameTaken : true}
    // },
    // err=>{
    //     uError = {usernameTaken : true}
    //     return uError
    // })


  }

}
