import {NgModule} from '@angular/core';
import {RootModule} from '../../../root.module';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {GroupManageComponent} from './group-manage.component';

@NgModule({
    declarations: [
        GroupManageComponent
    ],
    exports: [GroupManageComponent],
    imports: [
        RootModule,
        TableListModule,
    ]
})
export class GroupManageExportModule{
}
