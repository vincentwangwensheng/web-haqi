import {NgModule} from '@angular/core';
import {AccountManageComponent} from './account-manage.component';
import {RootModule} from '../../../root.module';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {RouterModule} from '@angular/router';
import {MatChipsModule} from '@angular/material';
import {RoleManageExportModule} from '../role-manage/role-manage-export.module';
import {ConfirmDialogModule} from '../../../components/confirm-dialog/confirm-dialog.module';
import {ChangePasswordModule} from '../../../components/change-password/change-password.module';
import {InjectConfirmDialogModule} from '../../../components/inject-confirm-dialog/inject-confirm-dialog.module';
import {AutoSelectModule} from '../../../components/auto-select/auto-select.module';


@NgModule({
    declarations: [
        AccountManageComponent
    ],
    imports: [
        RootModule,
        RoleManageExportModule,
        MatChipsModule,
        AutoSelectModule,
        ConfirmDialogModule,
        ChangePasswordModule,
        InjectConfirmDialogModule,
        TableListModule,
        RouterModule.forChild([{path: '', component: AccountManageComponent}])
    ]
})
export class AccountManageModule {
}
