import {NgModule} from '@angular/core';
import {RootModule} from '../../../../root.module';
import {EditStrategyComponent} from './edit-strategy.component';
import {RouterModule} from '@angular/router';
import {StrategyGuard} from '../../../../guards/strategy-guard';
import {
    MatAutocompleteModule, MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule
} from '@angular/material';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {CouponMaintainExportModule} from '../../ecoupon-list/coupon-maintain/coupon-maintain-export.module';
import {PassengersTagManagementExportModule} from '../../tag-management/passengers-tag-management/passengers-tag-management-export.module';
import {MerchantsTagManagementExportModule} from '../../tag-management/merchants-tag-management/merchants-tag-management-export.module';
import {MarketingManageExportModule} from '../../marketing-manage/marketing-manage-export.module';
import {FuseSidebarModule} from '../../../../../@fuse/components';
import {MessageTemplateExportModule} from '../../message-template/message-template-export.module';
import {StoreManageExportModule} from '../../store-mange/store-manage-export.module';
import {CouponListModule} from '../coupon-list/coupon-list.module';
import {ActivityListExportModule} from '../../coupon-manage/activity-list/activity-list-export.module';
import {MallManageExportModule} from '../../mall-manage/mall-manage-export.module';

@NgModule({
    declarations: [EditStrategyComponent],
    imports: [
        RootModule,
        MatFormFieldModule,
        MatInputModule,
        MatRippleModule,
        MatSelectModule,
        MatChipsModule,
        FuseSidebarModule,
        MatSlideToggleModule,
        CouponMaintainExportModule,
        PassengersTagManagementExportModule,
        MerchantsTagManagementExportModule,
        MarketingManageExportModule,
        MessageTemplateExportModule,
        TextFieldModule,
        MaterialDatePickerModule,
        RouterModule.forChild([{path: '', component: EditStrategyComponent, canDeactivate: [StrategyGuard]}]),
        StoreManageExportModule,
        MallManageExportModule,
        MatTabsModule,
        CouponListModule,
        MaterialDatePickerModule,
        ActivityListExportModule,
        MatAutocompleteModule,
        MatCheckboxModule
    ],
    providers: [StrategyGuard]
})
export class EditStrategyModule {
}
