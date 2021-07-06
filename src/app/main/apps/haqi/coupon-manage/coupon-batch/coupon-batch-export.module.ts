import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../../../root.module';
import {TableListModule} from '../../../../../components/table-list/table-list.module';
import {CouponBatchComponent} from './coupon-batch.component';

@NgModule({
  declarations: [
      CouponBatchComponent
  ],
  exports: [
      CouponBatchComponent
  ],
  imports: [
      CommonModule,
      RootModule,
      TableListModule
  ]
})
export class CouponBatchExportModule { }
