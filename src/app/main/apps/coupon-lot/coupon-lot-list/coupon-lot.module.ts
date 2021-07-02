import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CouponLotComponent} from './coupon-lot.component';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {RouterModule} from '@angular/router';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';



@NgModule({
  declarations: [CouponLotComponent],
  imports: [
      CommonModule ,
      RootModule,
      TableListModule,
      RouterModule.forChild([{path: '', component: CouponLotComponent}])
  ],
    providers: [
        NewDateTransformPipe
    ]
})
export class CouponLotModule { }
