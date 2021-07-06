import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CouponRuleComponent} from './coupon-rule.component';
import {RootModule} from '../../../../../root.module';
import {TableListModule} from '../../../../../components/table-list/table-list.module';
import {CouponManageService} from '../coupon-manage.service';

@NgModule({
  declarations: [
    CouponRuleComponent
  ],
  exports: [
    CouponRuleComponent
  ],
  imports: [
    CommonModule,
    RootModule,
    TableListModule
  ],
  providers: [
    CouponManageService
  ]
})
export class CouponRuleExportModule { }
