import { NgModule } from '@angular/core';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {TranslateModule} from '@ngx-translate/core';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {CouponMaintainComponent} from './coupon-maintain.component';
import {RouterModule} from '@angular/router';

@NgModule({
    declarations: [CouponMaintainComponent],
    imports: [
        RouterModule,
        TableListModule ,
        TranslateModule,
    ],
    exports: [CouponMaintainComponent],
    providers: [
        NewDateTransformPipe
    ]
})
export class CouponMaintainExportModule { }
