import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CouponPushComponent} from './coupon-push.component';

import {RouterModule} from '@angular/router';
import {CouponRuleExportModule} from '../coupon-rule/coupon-rule-export.module';
import {RootModule} from '../../../../../root.module';
import {TableListModule} from '../../../../../components/table-list/table-list.module';
import {MemberGroupExportModule} from '../../../memberManagement/member-group/member-group-export.module';
import {PassengersManageExportModule} from '../../../memberManagement/passengers-manage/passengers-manage-export.module';
import {CouponManageService} from '../coupon-manage.service';

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
