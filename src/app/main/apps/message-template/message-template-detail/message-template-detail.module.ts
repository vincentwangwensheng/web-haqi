import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MessageTemplateDetailComponent} from './message-template-detail.component';
import {SharedModule} from '../../../../../@fuse/shared.module';
import {FuseSidebarModule} from '../../../../../@fuse/components';
import {
    MatButtonModule,
    MatCheckboxModule, MatDialogModule,
    MatFormFieldModule,
    MatIconModule, MatInputModule, MatListModule,
    MatMenuModule,
    MatPaginatorModule, MatSelectModule, MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule, MatTreeModule ,
    MatDividerModule
} from '@angular/material';
import {CdkTreeModule} from '@angular/cdk/tree';
import {TranslateModule} from '@ngx-translate/core';
import {ConfirmDialogModule} from '../../../../components/confirm-dialog/confirm-dialog.module';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {RouterModule} from '@angular/router';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {DragDropModule} from '@angular/cdk/drag-drop';

const routes = [{
    path: '',
    component: MessageTemplateDetailComponent
}];

@NgModule({
    declarations: [MessageTemplateDetailComponent],
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
        MatListModule,
        NgxDaterangepickerMd.forRoot({
            separator: ' - ',
            applyLabel: 'Okay',
        }),
        DragDropModule,
        MatDividerModule,
        RouterModule.forChild(routes)
    ],
    providers: [
        NewDateTransformPipe
    ]
})
export class MessageTemplateDetailModule {
}
