import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import {ContentManageService} from '../content-manage.service';
import {MerchantNoticeComponent} from './merchant-notice.component';
import {CouponManageService} from '../../coupon-manage/coupon-manage.service';
import {MerchantNoticeExportModule} from './merchant-notice-export.module';

@NgModule({
  imports: [
    MerchantNoticeExportModule,
    RouterModule.forChild([{path: '', component: MerchantNoticeComponent}])
  ],
  providers: [
    CouponManageService,
    ContentManageService
  ]
})
export class MerchantNoticeModule { }
