import {NgModule} from '@angular/core';
import {MerchantsTagManagementComponent} from './merchants-tag-management.component';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {QUILL_CONFIG_TOKEN} from 'ngx-quill';
import {CommonModule} from '@angular/common';


@NgModule({
    declarations: [MerchantsTagManagementComponent],
    imports: [
        CommonModule,
        RootModule,
        TableListModule
    ],
    exports: [MerchantsTagManagementComponent],
    providers: [
        NewDateTransformPipe , {
            provide: QUILL_CONFIG_TOKEN,
            useValue: { LogLevel: 'Error' },
        }
    ]
})
export class MerchantsTagManagementExportModule {
}
