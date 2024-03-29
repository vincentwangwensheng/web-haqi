import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../../../../@fuse/shared.module';
import {FuseSidebarModule} from '../../../../../@fuse/components';
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
import {ConfirmDialogModule} from '../../../../components/confirm-dialog/confirm-dialog.module';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {FormsModule} from '@angular/forms';
import {MarketingManageEditComponent} from './marketing-manage-edit.component';
import {CustomPipesModule} from '../../../../pipes/customPipes.module';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {QUILL_CONFIG_TOKEN, QuillModule} from 'ngx-quill';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {MallListExportModule} from '../../mall-list/mall-list-export.module';
import {MerchantsTagManagementExportModule} from '../../haqi/merchants-tag-management/merchants-tag-management-export.module';
import {ActivityPreCommonModule} from '../activity-pre-common/activity-pre-common.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MembersListExportModule} from '../../bonus-point-rules/members-list/members-list.export.module';
import {StoreManageExportModule} from '../../haqi/mall-management/store-mange/store-manage-export.module';

const routes: Routes = [
  {
    path     : '',
    component: MarketingManageEditComponent,
  }
];

@NgModule({
  declarations: [MarketingManageEditComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
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
        MallListExportModule,
        ActivityPreCommonModule ,
        MatRippleModule,
        DragDropModule,
        MatProgressSpinnerModule,
        MembersListExportModule,
        StoreManageExportModule
    ],
    providers: [NewDateTransformPipe,
        {
            provide: QUILL_CONFIG_TOKEN,
            useValue: { LogLevel: 'Error' }
        }
    ]
})
export class MarketingManageEditModule { }
