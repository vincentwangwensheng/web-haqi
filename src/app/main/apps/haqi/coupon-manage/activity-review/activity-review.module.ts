import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import {ActivityReviewExportModule} from './activity-review-export.module';
import {ActivityReviewComponent} from './activity-review.component';
import {CouponManageService} from '../coupon-manage.service';

@NgModule({
  imports: [
    ActivityReviewExportModule,
    RouterModule.forChild([{path: '', component: ActivityReviewComponent}])
  ],
  providers: [
    CouponManageService
  ]
})
export class ActivityReviewModule { }
