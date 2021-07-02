import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {RouterModule} from '@angular/router';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {RootModule} from '../../../../root.module';
import {PaymentRecordComponent} from './payment-record.component';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {PaymentRecordDetailModule} from '../payment-record-detail/payment-record-detail.module';



@NgModule({
  declarations: [PaymentRecordComponent],
  imports: [
      CommonModule,
      RootModule,
      TableListModule,
      TranslateModule,
      PaymentRecordDetailModule,
      RouterModule.forChild([{path: '', component: PaymentRecordComponent}])
  ],
    providers: [
        NewDateTransformPipe
    ]
})
export class PaymentRecordModule { }
