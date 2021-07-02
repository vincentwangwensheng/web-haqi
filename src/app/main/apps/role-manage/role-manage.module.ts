import {NgModule} from '@angular/core';
import {RoleManageComponent} from './role-manage.component';
import {RouterModule} from '@angular/router';
import {RoleManageExportModule} from './role-manage-export.module';


@NgModule({
    imports: [
        RoleManageExportModule,
        RouterModule.forChild([{path: '', component: RoleManageComponent}])
    ]
})
export class RoleManageModule {
}
