import { NgModule } from '@angular/core';
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
    MatProgressSpinnerModule,
    MatRadioModule,
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
import {MarketingManageDetailComponent} from './marketing-manage-detail.component';
import {CustomPipesModule} from '../../../../pipes/customPipes.module';
import {QUILL_CONFIG_TOKEN, QuillModule} from 'ngx-quill';
import {MerchantsTagManagementExportModule} from '../../haqi/merchants-tag-management/merchants-tag-management-export.module';
import {ActivityPreCommonModule} from '../activity-pre-common/activity-pre-common.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {StoreManageExportModule} from '../../haqi/mall-management/store-mange/store-manage-export.module';

const routes: Routes = [
  {
    path     : '',
    component: MarketingManageDetailComponent,
  }
];

@NgModule({
  declarations: [MarketingManageDetailComponent],
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
        QuillModule,
        MerchantsTagManagementExportModule ,
        ActivityPreCommonModule,
        DragDropModule,
        MatProgressSpinnerModule,
        StoreManageExportModule
    ],
    providers: [
        NewDateTransformPipe,
        {
            provide: QUILL_CONFIG_TOKEN,
            useValue: { LogLevel: 'Error' }
        }
    ]
})
export class MarketingManageDetailModule { }
