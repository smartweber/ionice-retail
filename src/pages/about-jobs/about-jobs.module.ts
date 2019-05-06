import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AboutJobsPage } from './about-jobs';

@NgModule({
  declarations: [
    AboutJobsPage,
  ],
  imports: [
    IonicPageModule.forChild(AboutJobsPage),
  ],
})
export class AboutJobsPageModule {}
