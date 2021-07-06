import {NgModule} from '@angular/core';

import {PassengersManageComponent} from './passengers-manage.component';
import {
    MatButtonModule, MatCheckboxModule,
    MatFormFieldModule, MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule
} from '@angular/material';
import {FuseSidebarModule} from '../../../../../@fuse/components';
import {SharedModule} from '../../../../../@fuse/shared.module';
import {ConfirmDialogModule} from '../../../../components/confirm-dialog/confirm-dialog.module';
import {CommonModule} from '@angular/common';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {TranslateModule} from '@ngx-translate/core';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {SpinnerLoadingModule} from '../../../../components/spinner-loading/spinner-loading.module';


@NgModule({
    declarations: [PassengersManageComponent],
    imports: [
        CommonModule,
        SharedModule,
        FuseSidebarModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatFormFieldModule,
        TranslateModule,

        ConfirmDialogModule,
        MatSnackBarModule,
        MatSelectModule,
        TableListModule,
        SpinnerLoadingModule
    ],
    exports: [PassengersManageComponent],
    providers: [
        NewDateTransformPipe
    ]
})
export class PassengersManageExportModule {
}
