import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IntegralRuleComponent} from './integral-rule.component';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {TranslateModule} from '@ngx-translate/core';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {TabsVerticalModule} from '../../../../components/tabs-vertical/tabs-vertical.module';
import {RouterModule} from '@angular/router';
import {MatCheckboxModule, MatRadioModule, MatSlideToggleModule, MatTabsModule} from '@angular/material';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {GroupManageExportModule} from '../../group-manage/group-manage-export.module';
import {MallListExportModule} from '../../mall-list/mall-list-export.module';
import {StoreManageExportModule} from '../../store-mange/store-manage-export.module';



@NgModule({
  declarations: [IntegralRuleComponent],
    imports: [
        CommonModule,
        RootModule,
        TableListModule,
        TranslateModule,
        NgxDatatableModule,
        TabsVerticalModule,
        RouterModule.forChild([{path: '', component: IntegralRuleComponent}]),
        MatTabsModule,
        MatCheckboxModule,
        MatRadioModule,
        MaterialDatePickerModule,
        GroupManageExportModule,
        MallListExportModule,
        StoreManageExportModule,
        MatSlideToggleModule
    ],
  providers: [
    NewDateTransformPipe
  ]
})
export class IntegralRuleModule { }
