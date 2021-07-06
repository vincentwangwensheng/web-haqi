import { NgModule } from '@angular/core';
import {IntegralAdjustmentComponent} from './integral-adjustment.component';
import {RootModule} from '../../../root.module';
import {RouterModule} from '@angular/router';
import {
    MatAutocompleteModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
} from '@angular/material';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {ConfirmDialogModule} from '../../../components/confirm-dialog/confirm-dialog.module';
import {PassengersManageExportModule} from '../memberManagement/passengers-manage/passengers-manage-export.module';
import {CouponMaintainExportModule} from '../ecoupon-list/coupon-maintain/coupon-maintain-export.module';
import {MarketingManageExportModule} from '../marketing-manage/marketing-manage-export.module';
import {MembersListExportModule} from '../bonus-point-rules/members-list/members-list.export.module';
import {StoreManageExportModule} from '../haqi/mall-management/store-mange/store-manage-export.module';
import {MallListExportModule} from '../mall-list/mall-list-export.module';
import {MaterialDatePickerModule} from '../../../components/material-date-picker/material-date-picker.module';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';



@NgModule({
  declarations: [IntegralAdjustmentComponent],
    imports: [
        RootModule,
        MatCardModule,
        TableListModule,
        MatFormFieldModule,
        MatInputModule,
        ConfirmDialogModule,
        PassengersManageExportModule,
        CouponMaintainExportModule,
        MarketingManageExportModule,
        RouterModule.forChild([{path: '', component: IntegralAdjustmentComponent}]),
        MatSelectModule,
        MatAutocompleteModule,
        MembersListExportModule,
        StoreManageExportModule,
        MallListExportModule,
        MaterialDatePickerModule
    ],
    providers: [
        NewDateTransformPipe
    ]
})
export class IntegralAdjustmentModule { }
