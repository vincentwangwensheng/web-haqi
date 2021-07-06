import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MerchantsTagManagementComponent} from './merchants-tag-management.component';
import {MerchantsTagManagementExportModule} from './merchants-tag-management-export.module';

@NgModule({
    imports: [
        MerchantsTagManagementExportModule,
        RouterModule.forChild([{path: '', component: MerchantsTagManagementComponent}])
    ]
})
export class MerchantsTagManagementModule {
}
