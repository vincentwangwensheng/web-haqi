import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CouponMaintainComponent} from './coupon-maintain.component';
import {CouponMaintainExportModule} from './coupon-maintain-export.module';

@NgModule({
    imports: [
        CouponMaintainExportModule,
        RouterModule.forChild([{path: '', component: CouponMaintainComponent}])
    ]
})
export class CouponMaintainModule {
}
