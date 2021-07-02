import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CouponPushComponent} from './coupon-push.component';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {CouponManageService} from '../coupon-manage.service';
import {RouterModule} from '@angular/router';
import {CouponRuleExportModule} from '../coupon-rule/coupon-rule-export.module';
import {PassengersManageExportModule} from '../../passengers-manage/passengers-manage-export.module';
import {MemberGroupExportModule} from '../../member-group/member-group-export.module';
// import {UsersManageExportModule} from '../../users-manage/users-manage-export.module';

@NgModule({
  declarations: [
      CouponPushComponent
  ],
  exports: [
      CouponPushComponent
  ],
    imports: [
        CommonModule,
        RootModule,
        CouponRuleExportModule,
        // UsersManageExportModule,
        TableListModule,
        RouterModule,
        PassengersManageExportModule,
        MemberGroupExportModule
    ],
  providers: [
    CouponManageService
  ]
})
export class CouponPushExportModule { }
