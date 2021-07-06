import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Route, RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../../../../../@fuse/shared.module';
import {FuseSidebarModule} from '../../../../../../@fuse/components';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule, MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {ConfirmDialogModule} from '../../../../../components/confirm-dialog/confirm-dialog.module';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {FormsModule} from '@angular/forms';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {CustomPipesModule} from '../../../../../pipes/customPipes.module';
import {QUILL_CONFIG_TOKEN, QuillModule} from 'ngx-quill';
import {MaterialDatePickerModule} from '../../../../../components/material-date-picker/material-date-picker.module';
import {EssayAddComponent} from './essay-add.component';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MerchantsTagManagementExportModule} from '../../../haqi/merchants-tag-management/merchants-tag-management-export.module';
import {DragDropModule} from '@angular/cdk/drag-drop';

const routes: Routes = [
    {
        path: '',
        component: EssayAddComponent
    }
];

@NgModule({
    declarations: [EssayAddComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
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
        MatInputModule,

        ConfirmDialogModule,
        MatSnackBarModule,
        MatSelectModule,
        MatRadioModule,
        NgxDaterangepickerMd.forRoot({
            separator: ' - ',
            applyLabel: 'Okay',
        }),
        FormsModule,
        MatDialogModule,
        CustomPipesModule,
        MatSlideToggleModule,
        NgxDatatableModule,
        QuillModule,
        MaterialDatePickerModule,
        MatProgressBarModule,
        MerchantsTagManagementExportModule,
        MatRippleModule,
        DragDropModule,
        MatProgressSpinnerModule,
    ],
    providers: [
        NewDateTransformPipe,
        {
            provide: QUILL_CONFIG_TOKEN,
            useValue: {LogLevel: 'Error'}
        }
    ]
})
export class EssayAddModule {
}
