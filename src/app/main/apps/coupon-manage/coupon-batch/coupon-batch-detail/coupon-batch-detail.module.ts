import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../../../root.module';
import {TableListModule} from '../../../../../components/table-list/table-list.module';
import {RouterModule} from '@angular/router';
import {CouponBatchDetailComponent} from './coupon-batch-detail.component';
import {MaterialDatePickerModule} from '../../../../../components/material-date-picker/material-date-picker.module';
import {CouponManageService} from '../../coupon-manage.service';
import {CouponRuleExportModule} from '../../coupon-rule/coupon-rule-export.module';

@NgModule({
  declarations: [
    CouponBatchDetailComponent
  ],
  imports: [
    CommonModule,
    MaterialDatePickerModule,
    RootModule,
    TableListModule,
    RouterModule.forChild([{path: '', component: CouponBatchDetailComponent}]),
    CouponRuleExportModule
  ],
  providers: [
    CouponManageService
  ]
})
export class CouponBatchDetailModule { }
