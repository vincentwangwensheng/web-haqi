import { NgModule } from '@angular/core';
import {MemberGroupAddComponent} from './member-group-add.component';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {RouterModule} from '@angular/router';
import {
  MatAutocompleteModule,
  MatCardModule, MatChipsModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule
} from '@angular/material';
import {ConfirmDialogModule} from '../../../../components/confirm-dialog/confirm-dialog.module';
import {PassengersManageExportModule} from '../../passengers-manage/passengers-manage-export.module';
import {CouponMaintainExportModule} from '../../ecoupon-list/coupon-maintain/coupon-maintain-export.module';
import {MarketingManageExportModule} from '../../marketing-manage/marketing-manage-export.module';
import {PassengersTagManagementExportModule} from '../../tag-management/passengers-tag-management/passengers-tag-management-export.module';
import {MerchantsTagManagementExportModule} from '../../tag-management/merchants-tag-management/merchants-tag-management-export.module';
import {AutoSelectModule} from '../../../../components/auto-select/auto-select.module';

@NgModule({
  declarations: [
      MemberGroupAddComponent
  ],
  imports: [
    RootModule,
    MatCardModule,
    TableListModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    ConfirmDialogModule,
    PassengersManageExportModule,
    PassengersTagManagementExportModule,
    CouponMaintainExportModule,
    MarketingManageExportModule,
    RouterModule.forChild([{path: '', component: MemberGroupAddComponent}]),
    MatSelectModule,
    MatAutocompleteModule,
    AutoSelectModule,
    MerchantsTagManagementExportModule
  ]
})
export class MemberGroupAddModule { }
