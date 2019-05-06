import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AboutContactPage } from './about-contact';

@NgModule({
  declarations: [
    AboutContactPage,
  ],
  imports: [
    IonicPageModule.forChild(AboutContactPage),
  ],
})
export class AboutContactPageModule {}
