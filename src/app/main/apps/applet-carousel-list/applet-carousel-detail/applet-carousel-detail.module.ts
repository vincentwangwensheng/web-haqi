import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppletCarouselDetailComponent} from './applet-carousel-detail.component';
import {SharedModule} from '../../../../../@fuse/shared.module';
import {FuseSidebarModule} from '../../../../../@fuse/components';
import {
    MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule,
    MatIconModule, MatInputModule,
    MatMenuModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule, MatTreeModule
} from '@angular/material';
import {CdkTreeModule} from '@angular/cdk/tree';
import {TranslateModule} from '@ngx-translate/core';
import {ConfirmDialogModule} from '../../../../components/confirm-dialog/confirm-dialog.module';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {RouterModule} from '@angular/router';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {MallListExportModule} from '../../mall-list/mall-list-export.module';
import {MarketingManageExportModule} from '../../marketing-manage/marketing-manage-export.module';

const routes = [{path: '', component: AppletCarouselDetailComponent}];

@NgModule({
  declarations: [AppletCarouselDetailComponent],
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
        RouterModule.forChild(routes),
        MaterialDatePickerModule,
        MallListExportModule,
        MatProgressBarModule,
        MarketingManageExportModule

    ],
  providers: [
    NewDateTransformPipe
  ]
})
export class AppletCarouselDetailModule { }
