import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
    MatButtonModule, MatIconModule, MatMenuModule, MatSnackBarModule, MatTooltipModule, MatFormFieldModule,
    MatSelectModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCheckboxModule, MatInputModule, MatTreeModule
    , MatDialogModule ,
} from '@angular/material';
import {CdkTreeModule} from '@angular/cdk/tree';
import {TranslateModule} from '@ngx-translate/core';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {CommonModule} from '@angular/common';
import {TagDetailManagementComponent} from './tag-detail-management.component';
import {SharedModule} from '../../../../../../@fuse/shared.module';
import {FuseSidebarModule} from '../../../../../../@fuse/components';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {ConfirmDialogModule} from '../../../../../components/confirm-dialog/confirm-dialog.module';

@NgModule({
    declarations: [TagDetailManagementComponent],
    imports: [
        SharedModule,
        FuseSidebarModule,
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        CdkTreeModule,
        MatTreeModule,
        TranslateModule,
        ConfirmDialogModule,
        MatSnackBarModule,
        NgxDaterangepickerMd.forRoot({
            separator: ' - ',
            applyLabel: 'Okay',
        }),
        RouterModule.forChild([{path: '', component: TagDetailManagementComponent}])
    ] ,
    providers: [
        NewDateTransformPipe
    ]
})
export class TagDetailManagementModule {
}
