import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../../../root.module';
import {TableListModule} from '../../../../../components/table-list/table-list.module';
import {StandardQuestionComponent} from './standard-question.component';
import {EditDialogModule} from '../../../../../components/edit-dialog/edit-dialog.module';
import {AutoSelectModule} from '../../../../../components/auto-select/auto-select.module';
import {MallManageExportModule} from '../../mall-management/mall-manage/mall-manage-export.module';


@NgModule({
  declarations: [
    StandardQuestionComponent
  ],
  exports: [
    StandardQuestionComponent
  ],
    imports: [
        CommonModule,
        RootModule,
        EditDialogModule,
        TableListModule,
        AutoSelectModule,
        MallManageExportModule
    ]
})
export class StandardQuestionExportModule { }
