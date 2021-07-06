import {NgModule} from '@angular/core';
import {CouponListComponent} from './coupon-list.component';
import {NewTableListModule} from '../../../../../components/super-table-list/new-table-list.module';
import {CouponListService} from './coupon-list.service';


@NgModule({
    declarations: [
        CouponListComponent
    ],
    imports: [
        NewTableListModule.forChild(CouponListService)
    ],
    exports: [
        CouponListComponent
    ]
})
export class CouponListModule {
}
