import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReportUpTemplateComponent} from './report-up-template.component';
import {RootModule} from '../../../../root.module';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {MatCheckboxModule, MatProgressSpinnerModule, MatRippleModule} from '@angular/material';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {NewTableListModule} from '../../../../components/super-table-list/new-table-list.module';


@NgModule({
    declarations: [ReportUpTemplateComponent],
    exports: [ReportUpTemplateComponent],
    imports: [
        CommonModule,
        RootModule,
        MaterialDatePickerModule,
        MatCheckboxModule,
        NgxDatatableModule,
        MatProgressSpinnerModule,
        MatRippleModule,
        NewTableListModule,
    ]
})
export class ReportUpTemplateModule {
}
