import {NgModule} from '@angular/core';
import {BsTypeExportModule} from './bs-type-export.module';
import {RouterModule} from '@angular/router';
import {BsTypeComponent} from './bs-type.component';


@NgModule({
    imports: [
        BsTypeExportModule,
        RouterModule.forChild([{path: '', component: BsTypeComponent}])
    ]
})
export class BsTypeModule {
}
