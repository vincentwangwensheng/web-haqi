import {NgModule} from '@angular/core';
import {CouponReissueComponent} from './coupon-reissue.component';
import {RootModule} from '../../../root.module';
import {RouterModule} from '@angular/router';
import {MatCardModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import {PassengersManageExportModule} from '../passengers-manage/passengers-manage-export.module';
import {CouponMaintainExportModule} from '../ecoupon-list/coupon-maintain/coupon-maintain-export.module';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {MarketingManageExportModule} from '../marketing-manage/marketing-manage-export.module';
import {ConfirmDialogModule} from '../../../components/confirm-dialog/confirm-dialog.module';


@NgModule({
    declarations: [CouponReissueComponent],
    imports: [
        RootModule,
        MatCardModule,
        TableListModule,
        MatFormFieldModule,
        MatInputModule,
        ConfirmDialogModule,
        PassengersManageExportModule,
        CouponMaintainExportModule,
        MarketingManageExportModule,
        RouterModule.forChild([{path: '', component: CouponReissueComponent}])
    ]
})
export class CouponReissueModule {
}
