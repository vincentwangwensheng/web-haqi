import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MessageSubscribeDetailComponent} from '../../applet-mask/message-subscribe/message-subscribe-detail/message-subscribe-detail.component';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {TranslateModule} from '@ngx-translate/core';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {TabsVerticalModule} from '../../../../components/tabs-vertical/tabs-vertical.module';
import {RouterModule} from '@angular/router';
import {MatCheckboxModule, MatSlideToggleModule, MatTabsModule} from '@angular/material';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MemberSettingComponent} from './member-setting.component';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {CouponRuleExportModule} from '../../coupon-manage/coupon-rule/coupon-rule-export.module';

@NgModule({
  declarations: [MemberSettingComponent],
    imports: [
        CommonModule,
        RootModule,
        TableListModule,
        TranslateModule,
        NgxDatatableModule,
        TabsVerticalModule,
        MatSlideToggleModule,
        RouterModule.forChild([{path: '', component: MemberSettingComponent}]),
        MatTabsModule,
        MatCheckboxModule,
        MaterialDatePickerModule,
        CouponRuleExportModule
    ],
  providers: [
    NewDateTransformPipe
  ]
})
export class MemberSettingModule { }
