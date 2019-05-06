import { NgModule } from '@angular/core';
import {IonicPageModule, IonicModule} from "ionic-angular";
import { ModalNavigationComponent } from './modal-navigation/modal-navigation';
import { EmojiPickerComponent } from './emoji-picker/emoji-picker';

@NgModule({
	declarations: [ModalNavigationComponent,
    EmojiPickerComponent,
  ],
	imports: [IonicPageModule.forChild(ModalNavigationComponent),IonicPageModule.forChild(EmojiPickerComponent), IonicModule],
	exports: [ModalNavigationComponent,
    EmojiPickerComponent,
    ]
})
export class ComponentsModule {}
