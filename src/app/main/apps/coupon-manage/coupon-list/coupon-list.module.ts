import { NgModule } from '@angular/core';
import {CouponListExportModule} from './coupon-list-export.module';
import {RouterModule} from '@angular/router';
import {CouponListComponent} from './coupon-list.component';
import {CouponManageService} from '../coupon-manage.service';
import {DatePipe} from '@angular/common';

@NgModule({
  imports: [
    CouponListExportModule,
    RouterModule.forChild([{path: '', component: CouponListComponent}])
  ],
  providers: [
    CouponManageService,
      DatePipe
  ]
})
export class CouponListModule { }
