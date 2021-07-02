import {NgModule} from '@angular/core';
import {MallManageComponent} from './mall-manage.component';
import {RouterModule} from '@angular/router';
import {MallManageExportModule} from './mall-manage-export.module';


@NgModule({
    imports: [
        MallManageExportModule,
        RouterModule.forChild([{path: '', component: MallManageComponent}])
    ]
})
export class MallManageModule {
}
