import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule, MatCheckboxModule, MatIconModule, MatInputModule, MatRippleModule, MatSelectModule} from '@angular/material';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {TranslateModule} from '@ngx-translate/core';
import {QuillModule} from 'ngx-quill';
import {RootModule} from '../../../../root.module';
import {PaymentRecordDetailComponent} from './payment-record-detail.component';



@NgModule({
  declarations: [PaymentRecordDetailComponent],
  exports: [PaymentRecordDetailComponent],
  imports: [
      CommonModule,
      RootModule,
      MatSelectModule,
      MatCheckboxModule,
      MatInputModule,
      MatIconModule,
      MatButtonModule,
      TranslateModule,
      QuillModule,
      MatRippleModule,
      MaterialDatePickerModule,
  ]
})
export class PaymentRecordDetailModule { }
