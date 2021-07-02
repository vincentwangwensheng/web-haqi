import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BatchAddDetailComponent} from './batch-add-detail.component';
import {RouterModule} from '@angular/router';
import {RootModule} from '../../../../root.module';
import {CouponMaintainExportModule} from '../../ecoupon-list/coupon-maintain/coupon-maintain-export.module';
import {MatInputModule, MatRadioModule, MatSelectModule} from '@angular/material';
import {CouponTemplateModule} from '../../ecoupon-list/coupon-maintain/coupon-tempalte/coupon-template.module';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {QUILL_CONFIG_TOKEN, QuillModule} from 'ngx-quill';



@NgModule({
  declarations: [BatchAddDetailComponent],
  imports: [
      CommonModule ,
      RootModule,
      MatSelectModule,
      MatInputModule,
      MaterialDatePickerModule,
      MatRadioModule,
      CouponTemplateModule,
      QuillModule,
      CouponMaintainExportModule,
      RouterModule.forChild([{path: '', component: BatchAddDetailComponent}])
  ],
    providers: [
        NewDateTransformPipe , {
            provide: QUILL_CONFIG_TOKEN,
            useValue: { LogLevel: 'Error' },
        }
    ]
})
export class BatchAddDetailModule { }
