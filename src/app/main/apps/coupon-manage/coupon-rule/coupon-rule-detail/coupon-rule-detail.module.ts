import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialDatePickerModule} from '../../../../../components/material-date-picker/material-date-picker.module';
import {RootModule} from '../../../../../root.module';
import {TableListModule} from '../../../../../components/table-list/table-list.module';
import {RouterModule} from '@angular/router';
import {CouponRuleDetailComponent} from './coupon-rule-detail.component';
import {CouponManageService} from '../../coupon-manage.service';
import {
    MatCheckboxModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSlideToggleModule
} from '@angular/material';
import {DataPreviewModule} from '../../../../../components/data-preview/data-preview.module';
import {StoreManageExportModule} from '../../../mall-management/store-mange/store-manage-export.module';

@NgModule({
  declarations: [
    CouponRuleDetailComponent
  ],
    imports: [
        CommonModule,
        MaterialDatePickerModule,
        RootModule,
        TableListModule,
        RouterModule.forChild([{path: '', component: CouponRuleDetailComponent}]),
        MatRadioModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        DataPreviewModule,
        StoreManageExportModule
    ],
  providers: [
    CouponManageService
  ]
})
export class CouponRuleDetailModule { }
