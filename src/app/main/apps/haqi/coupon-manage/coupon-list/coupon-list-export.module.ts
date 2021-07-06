import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CouponListComponent} from './coupon-list.component';
import {RootModule} from '../../../../../root.module';
import {SpinnerLoadingModule} from '../../../../../components/spinner-loading/spinner-loading.module';
import {TableListModule} from '../../../../../components/table-list/table-list.module';

@NgModule({
  declarations: [
      CouponListComponent
  ],
  exports: [
      CouponListComponent
  ],
    imports: [
        CommonModule,
        RootModule,
        TableListModule,
        SpinnerLoadingModule
    ]
})
export class CouponListExportModule { }
