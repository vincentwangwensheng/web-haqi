import { NgModule } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {RootModule} from '../../../../../../root.module';
import {RouterModule} from '@angular/router';
import {MaterialDatePickerModule} from '../../../../../../components/material-date-picker/material-date-picker.module';
import {MatCheckboxModule, MatProgressBarModule, MatProgressSpinnerModule, MatRadioModule} from '@angular/material';
import {CouponRuleExportModule} from '../../coupon-rule/coupon-rule-export.module';
import {ActivityListDetailComponent} from './activity-list-detail.component';
import {CouponManageService} from '../../coupon-manage.service';
import {DataPreviewModule} from '../../../../../../components/data-preview/data-preview.module';
import {MemberExportCardModule} from '../../../../memberManagement/member-card/member-export-card.module';
import {MallManageExportModule} from '../../../mall-management/mall-manage/mall-manage-export.module';
import {ActivityListExportModule} from '../activity-list-export.module';

@NgModule({
  declarations: [
    ActivityListDetailComponent
  ],
    imports: [
        CommonModule,
        RootModule,
        RouterModule.forChild([{path: '', component: ActivityListDetailComponent}]),
        MaterialDatePickerModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatRadioModule,
        MallManageExportModule,
        CouponRuleExportModule,
        DataPreviewModule,
        MemberExportCardModule,
        ActivityListExportModule
    ],
  providers: [
    CouponManageService,
      DatePipe
  ]
})
export class ActivityListDetailModule { }
