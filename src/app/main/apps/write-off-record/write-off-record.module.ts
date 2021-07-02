import {NgModule} from '@angular/core';
import {WriteOffRecordComponent} from './write-off-record.component';
import {RootModule} from '../../../root.module';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {RouterModule} from '@angular/router';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {ConfirmDialogModule} from '../../../components/confirm-dialog/confirm-dialog.module';


@NgModule({
    declarations: [WriteOffRecordComponent],
    imports: [
        RootModule,
        TableListModule,
        ConfirmDialogModule,
        RouterModule.forChild([{path: '', component: WriteOffRecordComponent}])
    ],
    providers: [NewDateTransformPipe]
})
export class WriteOffRecordModule {
}
