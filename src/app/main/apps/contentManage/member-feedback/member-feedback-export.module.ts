import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {MemberFeedbackComponent} from './member-feedback.component';
import {EditDialogModule} from '../../../../components/edit-dialog/edit-dialog.module';


@NgModule({
  declarations: [
    MemberFeedbackComponent
  ],
  exports: [
    MemberFeedbackComponent
  ],
  imports: [
    CommonModule,
    EditDialogModule,
    RootModule,
    TableListModule
  ]
})
export class MemberFeedbackExportModule { }
