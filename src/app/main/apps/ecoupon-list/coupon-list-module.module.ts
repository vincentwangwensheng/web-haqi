import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../../../@fuse/shared.module';
import {MatButtonModule, MatIconModule, MatMenuModule, MatSnackBarModule, MatTooltipModule , MatFormFieldModule,
         MatTableModule , MatSortModule, MatPaginatorModule, MatCheckboxModule , MatSelectModule } from '@angular/material';
import {ConfirmDialogModule} from '../../../components/confirm-dialog/confirm-dialog.module';
import {FuseSidebarModule} from '../../../../@fuse/components';
import {TranslateModule} from '@ngx-translate/core';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {CouponListComponent} from './coupon-list.component';

@NgModule({
    declarations: [CouponListComponent],
    imports: [
        SharedModule,
        FuseSidebarModule,
        TableListModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatFormFieldModule,
        TranslateModule,

        ConfirmDialogModule,
        MatSnackBarModule,
        MatSelectModule,
        RouterModule.forChild([{path: '', component: CouponListComponent}])
    ],
    providers: [
        NewDateTransformPipe
    ]
})
export class  CouponListModule {
}
