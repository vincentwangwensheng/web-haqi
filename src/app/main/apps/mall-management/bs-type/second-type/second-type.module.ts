import {NgModule} from '@angular/core';
import {SecondTypeComponent} from './second-type.component';
import {TableListModule} from '../../../../../components/table-list/table-list.module';
import {BsTypeExportModule} from '../bs-type-export.module';
import {RouterModule} from '@angular/router';
import {RootModule} from '../../../../../root.module';
import {AutoSelectModule} from '../../../../../components/auto-select/auto-select.module';


@NgModule({
    declarations: [SecondTypeComponent],
    imports: [
        TableListModule,
        RootModule,
        AutoSelectModule,
        BsTypeExportModule,
        RouterModule.forChild([{path: '', component: SecondTypeComponent}])
    ]
})
export class SecondTypeModule {
}
