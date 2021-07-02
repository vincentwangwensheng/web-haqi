import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DetailTableListComponent} from './detail-table-list.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {NewDateTransformPipe} from '../../pipes/date-new-date-transform/new-date-transform.pipe';
import {RootModule} from '../../root.module';
import {DateTransformPipe} from '../../pipes/date-transform/date-transform.pipe';


@NgModule({
    declarations: [DetailTableListComponent],
    exports: [DetailTableListComponent],
    imports: [
        CommonModule,
        RootModule,
        NgxDatatableModule,
    ], providers: [
        NewDateTransformPipe , DateTransformPipe
    ]
})
export class DetailTableListModule {
}
