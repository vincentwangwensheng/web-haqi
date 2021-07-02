import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {ActivityReviewComponent} from './activity-review.component';

@NgModule({
  declarations: [
    ActivityReviewComponent
  ],
  exports: [
    ActivityReviewComponent
  ],
  imports: [
    CommonModule,
    RootModule,
    TableListModule,
  ]
})
export class ActivityReviewExportModule { }
