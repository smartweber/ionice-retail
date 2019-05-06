/**
 * @Author: Ruben
 * @Date:   2017-10-23T12:37:50-06:00
 * @Last modified by:   Ruben
 * @Last modified time: 2017-12-18T17:37:56-07:00
 */



import { platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {enableProdMode} from '@angular/core';
import { AppModule } from './app.module';


enableProdMode()
// window.console.log = function(){}

platformBrowserDynamic().bootstrapModule(AppModule);
