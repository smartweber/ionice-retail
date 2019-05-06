import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewAdvStep2Page } from './new-adv-step2';
import { GooglePlacesAutocompleteComponentModule } from 'ionic2-google-places-autocomplete';
import {DirectivesModule} from '../../directives/directives.module'

@NgModule({
  declarations: [
    NewAdvStep2Page
  ],
  imports: [
    DirectivesModule,
    IonicPageModule.forChild(NewAdvStep2Page),
    GooglePlacesAutocompleteComponentModule
  ],
})
export class NewAdvStep2PageModule {}
