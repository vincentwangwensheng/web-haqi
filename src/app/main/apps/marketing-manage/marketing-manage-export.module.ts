import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../../../../@fuse/shared.module';
import {FuseSidebarModule} from '../../../../@fuse/components';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatSelectModule, MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {ConfirmDialogModule} from '../../../components/confirm-dialog/confirm-dialog.module';
import {MarketingManageComponent} from './marketing-manage.component';
import {CustomPipesModule} from '../../../pipes/customPipes.module';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';


@NgModule({
    declarations: [MarketingManageComponent],
    exports: [MarketingManageComponent],
    imports: [
        CommonModule,
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
        CustomPipesModule,
        TableListModule,
        MatProgressSpinnerModule,
    ],
 providers: [NewDateTransformPipe]
})
export class MarketingManageExportModule { }
