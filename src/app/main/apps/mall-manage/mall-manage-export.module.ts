import {NgModule} from '@angular/core';
import {MallManageComponent} from './mall-manage.component';
import {RootModule} from '../../../root.module';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {RouterModule} from '@angular/router';


@NgModule({
    declarations: [
        MallManageComponent
    ],
    exports: [MallManageComponent],
    imports: [
        RootModule,
        TableListModule,
    ]
})
export class MallManageExportModule {
}
