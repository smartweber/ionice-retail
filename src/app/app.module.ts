/**
 * @Author: Ruben
 * @Date:   2017-10-02T09:40:09-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-17T03:57:44-07:00
 */



import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ImagePicker } from '@ionic-native/image-picker';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { EmailComposer } from '@ionic-native/email-composer';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { CardIO } from '@ionic-native/card-io';
import { Braintree } from '@ionic-native/braintree';
import { PayPal } from '@ionic-native/paypal';
import { Keyboard } from '@ionic-native/keyboard';

import { ClientProvider } from '../providers/client/client';
import { Validator } from '../providers/validators/validators';
import { ComponentsModule } from '../components/components.module';

import { FileTransfer } from '@ionic-native/file-transfer';

import { DirectivesModule } from '../directives/directives.module'
import { EmojiProvider } from '../providers/emoji/emoji';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { FCM } from '@ionic-native/fcm';
import { Push } from '@ionic-native/push';
import { RtProvider } from '../providers/rt/rt';
import { SocialSharing } from '@ionic-native/social-sharing';

import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { PipesModule } from '../pipes/pipes.module';
import { FcmProvider } from '../providers/fcm/fcm';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorProvider } from '../providers/auth-interceptor/auth-interceptor';


@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    PipesModule,
    ComponentsModule,
    DirectivesModule,
    IonicImageViewerModule,
    IonicModule.forRoot(MyApp, {
      mode: 'ios', tabsHideOnSubPages: "false",
      scrollPadding: false,
      scrollAssist: false,
      autoFocusAssist: false
    }),
    HttpClientModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ImagePicker,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorProvider, multi: true },
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ClientProvider,
    Validator,
    File,
    Keyboard,
    FileTransfer,
    Camera,
    EmailComposer,
    InAppBrowser,
    CardIO,
    Braintree,
    PayPal,
    EmojiProvider,
    Push,
    FCM,SocialSharing,
    RtProvider,
    Facebook, GooglePlus,
    FcmProvider
  ]
})
export class AppModule { }
