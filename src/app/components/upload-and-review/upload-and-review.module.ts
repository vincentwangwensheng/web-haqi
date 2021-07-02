import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatProgressBarModule, MatProgressSpinnerModule} from '@angular/material';
import {RootModule} from '../../root.module';
import {RouterModule} from '@angular/router';
import {UploadAndReviewComponent} from './upload-and-review.component';



@NgModule({
  declarations: [UploadAndReviewComponent],
  imports: [
    CommonModule,
    RootModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  exports: [
    UploadAndReviewComponent
  ]
})
export class UploadAndReviewModule { }
