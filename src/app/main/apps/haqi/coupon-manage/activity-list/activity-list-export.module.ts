import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../../../root.module';
import {TableListModule} from '../../../../../components/table-list/table-list.module';
import {ActivityListComponent} from './activity-list.component';
import {CouponManageService} from '../coupon-manage.service';
import {SpinnerLoadingModule} from '../../../../../components/spinner-loading/spinner-loading.module';

@NgModule({
  declarations: [
    ActivityListComponent
  ],
  exports: [
    ActivityListComponent
  ],
    imports: [
        CommonModule,
        RootModule,
        TableListModule,
        SpinnerLoadingModule,
    ],
  providers: [
    CouponManageService
  ]
})
export class ActivityListExportModule { }
