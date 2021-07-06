import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {StoreManageComponent} from './store-manage.component';
import {StoreManageExportModule} from './store-manage-export.module';

@NgModule({
    imports: [
        StoreManageExportModule,
        RouterModule.forChild([{path: '', component: StoreManageComponent}])
    ]
})
export class StoreManageModule {
}
