import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TabsVerticalComponent} from './tabs-vertical.component';
import {RootModule} from '../../root.module';



@NgModule({
  declarations: [TabsVerticalComponent],
  imports: [
    CommonModule,
    RootModule
  ],
  exports: [
    TabsVerticalComponent
  ]
})
export class TabsVerticalModule { }
