import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import {MemberFeedbackComponent} from './member-feedback.component';
import {MemberFeedbackExportModule} from './member-feedback-export.module';
import {ContentManageService} from '../content-manage.service';
import {CouponManageService} from '../../coupon-manage/coupon-manage.service';


@NgModule({
  imports: [
      MemberFeedbackExportModule,
    RouterModule.forChild([{path: '', component: MemberFeedbackComponent}])
  ],
  providers: [
    CouponManageService,
    ContentManageService
  ]
})
export class MemberFeedbackModule { }
