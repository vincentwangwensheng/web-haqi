import {NgModule} from '@angular/core';
import {PassengersManageDetailComponent} from './passengers-manage-detail.component';
import {RouterModule} from '@angular/router';
import {RootModule} from '../../../../../root.module';
import {MatChipsModule, MatFormFieldModule, MatInputModule, MatRippleModule, MatSelectModule, MatTableModule} from '@angular/material';
import {PassengersTagManagementExportModule} from '../../../tag-management/passengers-tag-management/passengers-tag-management-export.module';
import {MaterialDatePickerModule} from '../../../../../components/material-date-picker/material-date-picker.module';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {RelationPassengerTagsExportModule} from '../../../relation-passenger-tags/relation-passenger-tags-export.module';
import {MerchantsTagManagementExportModule} from '../../../tag-management/merchants-tag-management/merchants-tag-management-export.module';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {QUILL_CONFIG_TOKEN} from 'ngx-quill';

@NgModule({
    declarations: [PassengersManageDetailComponent],
    imports: [
        PassengersTagManagementExportModule,
        RouterModule.forChild([{
            path: '',
            component: PassengersManageDetailComponent,
        }]),
        RootModule,
        MaterialDatePickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
        MatRippleModule,
        MatTableModule,
        NgxDatatableModule,
        MerchantsTagManagementExportModule,
        NgxDaterangepickerMd.forRoot({
            separator: ' - ',
            applyLabel: 'Okay',
        }),
        RelationPassengerTagsExportModule,
    ], providers: [   NewDateTransformPipe,
    ]
})
export class PassengersManageDetailModule {
}
