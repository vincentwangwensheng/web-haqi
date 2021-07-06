import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../../../../root.module';
import {RouterModule} from '@angular/router';
import {MaterialDatePickerModule} from '../../../../../../components/material-date-picker/material-date-picker.module';
import {MatCheckboxModule, MatProgressBarModule, MatProgressSpinnerModule, MatRadioModule} from '@angular/material';
import {CouponRuleExportModule} from '../../coupon-rule/coupon-rule-export.module';
import {ActivityReviewDetailComponent} from './activity-review-detail.component';
import {CouponManageService} from '../../coupon-manage.service';
import {DataPreviewModule} from '../../../../../../components/data-preview/data-preview.module';

@NgModule({
  declarations: [
    ActivityReviewDetailComponent
  ],
  imports: [
    CommonModule,
    RootModule,
    RouterModule.forChild([{path: '', component: ActivityReviewDetailComponent}]),
    MaterialDatePickerModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatRadioModule,
    CouponRuleExportModule,
    DataPreviewModule
  ],
  providers: [
    CouponManageService
  ]
})
export class ActivityReviewDetailModule { }
