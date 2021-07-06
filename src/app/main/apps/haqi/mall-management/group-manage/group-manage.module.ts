import {NgModule} from '@angular/core';
import {GroupManageComponent} from './group-manage.component';
import {RouterModule} from '@angular/router';
import {GroupManageExportModule} from './group-manage-export.module';


@NgModule({
    imports: [
        GroupManageExportModule,
        RouterModule.forChild([{path: '**', component: GroupManageComponent}])
    ]
})
export class GroupManageModule {
}
