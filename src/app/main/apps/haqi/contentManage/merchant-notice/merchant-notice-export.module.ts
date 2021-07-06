import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../../../root.module';
import {TableListModule} from '../../../../../components/table-list/table-list.module';
import {MerchantNoticeComponent} from './merchant-notice.component';
import {EditDialogModule} from '../../../../../components/edit-dialog/edit-dialog.module';
import {MaterialDatePickerModule} from '../../../../../components/material-date-picker/material-date-picker.module';
import {MatRadioModule} from '@angular/material';
import {MallManageExportModule} from '../../mall-management/mall-manage/mall-manage-export.module';
import {StoreManageExportModule} from '../../mall-management/store-mange/store-manage-export.module';
import {DataPreviewModule} from '../../../../../components/data-preview/data-preview.module';


@NgModule({
  declarations: [
    MerchantNoticeComponent
  ],
  exports: [
    MerchantNoticeComponent
  ],
    imports: [
        CommonModule,
        RootModule,
        MaterialDatePickerModule,
        EditDialogModule,
        TableListModule,
        MatRadioModule,
        MallManageExportModule,
        StoreManageExportModule,
        DataPreviewModule
    ]
})
export class MerchantNoticeExportModule { }
