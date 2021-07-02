import {NgModule} from '@angular/core';
import {PassengersTagManagementComponent} from './passengers-tag-management.component';
import {RouterModule, Routes} from '@angular/router';
import {PassengersTagManagementExportModule} from './passengers-tag-management-export.module';

const routes: Routes = [
    {
        path: '',
        component: PassengersTagManagementComponent,
    }
];

@NgModule({
    declarations: [],
    imports: [
        PassengersTagManagementExportModule,
        RouterModule.forChild(routes),
    ]
})
export class PassengersTagManagementModule {
}
