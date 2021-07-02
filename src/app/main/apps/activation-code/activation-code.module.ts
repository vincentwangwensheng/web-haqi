import {NgModule} from '@angular/core';
import {ActivationCodeComponent} from './activation-code.component';
import {RootModule} from '../../../root.module';
import {MatInputModule, MatRadioModule} from '@angular/material';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {ConfirmDialogModule} from '../../../components/confirm-dialog/confirm-dialog.module';
import {StoreManageExportModule} from '../store-mange/store-manage-export.module';
import {RouterModule} from '@angular/router';


@NgModule({
    declarations: [ActivationCodeComponent],
    imports: [
        RootModule,
        MatInputModule,
        MatRadioModule,
        TableListModule,
        ConfirmDialogModule,
        StoreManageExportModule,
        RouterModule.forChild([{path: '', component: ActivationCodeComponent}])
    ]
})
export class ActivationCodeModule {
}
