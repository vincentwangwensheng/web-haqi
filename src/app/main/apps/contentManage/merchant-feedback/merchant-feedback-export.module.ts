import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {MerchantFeedbackComponent} from './merchant-feedback.component';
import {EditDialogModule} from '../../../../components/edit-dialog/edit-dialog.module';
import {UploadAndReviewModule} from '../../../../components/upload-and-review/upload-and-review.module';


@NgModule({
  declarations: [
    MerchantFeedbackComponent
  ],
  exports: [
    MerchantFeedbackComponent
  ],
  imports: [
    CommonModule,
    RootModule,
    EditDialogModule,
      UploadAndReviewModule,
    TableListModule
  ]
})
export class MerchantFeedbackExportModule { }
