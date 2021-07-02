import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {TranslateModule} from '@ngx-translate/core';
import {PassengersTagManagementComponent} from './passengers-tag-management.component';

@NgModule({
    declarations: [
        PassengersTagManagementComponent
    ],
    imports: [
        CommonModule,
        TableListModule,
        TranslateModule,
    ],
    exports: [
        PassengersTagManagementComponent
    ]
})
export class PassengersTagManagementExportModule {
}
