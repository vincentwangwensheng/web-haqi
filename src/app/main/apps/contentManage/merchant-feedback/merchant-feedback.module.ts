import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import {MerchantFeedbackComponent} from './merchant-feedback.component';
import {MerchantFeedbackExportModule} from './merchant-feedback-export.module';
import {ContentManageService} from '../content-manage.service';
import {CouponManageService} from '../../coupon-manage/coupon-manage.service';

@NgModule({
  imports: [
    MerchantFeedbackExportModule,
    RouterModule.forChild([{path: '', component: MerchantFeedbackComponent}])
  ],
  providers: [
    CouponManageService,
    ContentManageService
  ]
})
export class MerchantFeedbackModule { }
