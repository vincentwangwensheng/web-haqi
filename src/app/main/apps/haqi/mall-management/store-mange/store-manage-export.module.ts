import {NgModule} from '@angular/core';
import {StoreManageComponent} from './store-manage.component';
import {TableListModule} from '../../../../../components/table-list/table-list.module';
import {RootModule} from '../../../../../root.module';

@NgModule({
    declarations: [StoreManageComponent],
    imports: [
        RootModule,
        TableListModule,
    ],
    exports: [StoreManageComponent],
})
export class StoreManageExportModule {
}
