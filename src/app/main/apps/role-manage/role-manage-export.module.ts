import {NgModule} from '@angular/core';
import {RootModule} from '../../../root.module';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {RoleManageComponent} from './role-manage.component';


@NgModule({
    declarations: [RoleManageComponent],
    imports: [
        RootModule,
        TableListModule,
    ],
    exports: [
        RoleManageComponent
    ]
})
export class RoleManageExportModule {
}
