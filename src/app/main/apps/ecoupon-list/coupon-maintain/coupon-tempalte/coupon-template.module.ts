import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ConfirmDialogModule} from '../../../../../components/confirm-dialog/confirm-dialog.module';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule, MatFormFieldModule, MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule, MatSnackBarModule, MatSortModule, MatTableModule,
    MatTooltipModule,
    MatDividerModule,
    MatTreeModule, MatSlideToggleModule, MatProgressSpinnerModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {CdkTreeModule} from '@angular/cdk/tree';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {FuseSidebarModule} from '../../../../../../@fuse/components';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {QUILL_CONFIG_TOKEN, QuillModule} from 'ngx-quill';
import {MaterialDatePickerModule} from '../../../../../components/material-date-picker/material-date-picker.module';
import {SharedModule} from '../../../../../../@fuse/shared.module';
import {CouponTemplateComponent} from './coupon-template.component';
import {PassengersManageExportModule} from '../../../memberManagement/passengers-manage/passengers-manage-export.module';
import {StoreManageExportModule} from '../../../haqi/mall-management/store-mange/store-manage-export.module';
import {BusinessTypeModule} from '../../../business-type/business-type.module';
import {MemberExportCardModule} from '../../../memberManagement/member-card/member-export-card.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {UploadImgModule} from '../../../../../components/upload-img/upload-img.module';



@NgModule({
    declarations: [CouponTemplateComponent],
    imports: [
        SharedModule,
        FuseSidebarModule,
        CommonModule,
        MatIconModule,
        MatRadioModule,
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
        MatProgressBarModule,
        QuillModule,
        MaterialDatePickerModule,
        MatSlideToggleModule,
        NgxDaterangepickerMd.forRoot({
            separator: ' - ',
            applyLabel: 'Okay',
        }),
        SharedModule,
        FuseSidebarModule,
        CommonModule,
        MatIconModule,
        MatRadioModule,
        MatButtonModule,
        MatTooltipModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatDividerModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        CdkTreeModule,
        MatTreeModule,
        TranslateModule,
        ConfirmDialogModule,
        MatSnackBarModule,
        MatProgressBarModule,
        QuillModule,
        MaterialDatePickerModule,
        PassengersManageExportModule,
        StoreManageExportModule,
        BusinessTypeModule,
        MemberExportCardModule,
        UploadImgModule,
        NgxDaterangepickerMd.forRoot({
            separator: ' - ',
            applyLabel: 'Okay',
        }),
        DragDropModule,
        MatProgressSpinnerModule,
    ],
    exports: [CouponTemplateComponent],
    providers: [NewDateTransformPipe,
        {
            provide: QUILL_CONFIG_TOKEN,
            useValue: { LogLevel: 'Error' },
        }
    ]
})
export class CouponTemplateModule { }
