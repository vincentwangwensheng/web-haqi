import { NgModule } from '@angular/core';
import {CouponPushExportModule} from './coupon-push-export.module';
import {RouterModule} from '@angular/router';
import {CouponPushComponent} from './coupon-push.component';
import {CouponManageService} from '../coupon-manage.service';
import {PassengersManageExportModule} from '../../passengers-manage/passengers-manage-export.module';
import {MemberGroupExportModule} from '../../member-group/member-group-export.module';

@NgModule({
  imports: [
      CouponPushExportModule,
      RouterModule.forChild([{path: '', component: CouponPushComponent}]),
      PassengersManageExportModule,
      MemberGroupExportModule
  ],
  providers: [
      CouponManageService
  ]
})
export class CouponPushModule { }
