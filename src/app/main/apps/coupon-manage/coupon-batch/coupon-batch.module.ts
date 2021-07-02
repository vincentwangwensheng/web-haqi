import { NgModule } from '@angular/core';
import {CouponBatchExportModule} from './coupon-batch-export.module';
import {RouterModule} from '@angular/router';
import {CouponBatchComponent} from './coupon-batch.component';
import {CouponManageService} from '../coupon-manage.service';

@NgModule({
  imports: [
    CouponBatchExportModule,
    RouterModule.forChild([{path: '', component: CouponBatchComponent}])
  ],
  providers: [
    CouponManageService
  ]
})
export class CouponBatchModule { }
