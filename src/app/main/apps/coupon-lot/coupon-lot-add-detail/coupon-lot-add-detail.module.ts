import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../../root.module';
import {RouterModule} from '@angular/router';
import {CouponLotAddDetailComponent} from './coupon-lot-add-detail.component';
import {MatInputModule, MatRadioModule, MatSelectModule} from '@angular/material';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {CouponTemplateModule} from '../../ecoupon-list/coupon-maintain/coupon-tempalte/coupon-template.module';
import {CouponMaintainExportModule} from '../../ecoupon-list/coupon-maintain/coupon-maintain-export.module';
import {QUILL_CONFIG_TOKEN, QuillModule} from 'ngx-quill';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';



@NgModule({
  declarations: [CouponLotAddDetailComponent],
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
      RouterModule.forChild([{path: '', component: CouponLotAddDetailComponent}])
  ],
    providers: [
        NewDateTransformPipe , {
            provide: QUILL_CONFIG_TOKEN,
            useValue: { LogLevel: 'Error' },
        }
    ]
})
export class CouponLotAddDetailModule { }
