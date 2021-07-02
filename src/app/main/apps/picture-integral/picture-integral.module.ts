import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PictureIntegralComponent} from './picture-integral.component';
import {RootModule} from '../../../root.module';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {RouterModule} from '@angular/router';
import {MatFormFieldModule} from '@angular/material';
import {ImageShowModule} from '../../../components/image-show/image-show.module';



@NgModule({
  declarations: [
      PictureIntegralComponent
  ],
  imports: [
    CommonModule,
      RootModule,
      TableListModule,
      ImageShowModule,
      RouterModule.forChild([{path: '', component: PictureIntegralComponent}]),
      MatFormFieldModule
  ]
})
export class PictureIntegralModule { }
