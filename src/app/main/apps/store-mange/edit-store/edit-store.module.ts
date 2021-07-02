import {NgModule} from '@angular/core';
import {EditStoreComponent} from './edit-store.component';
import {RootModule} from '../../../../root.module';
import {RouterModule} from '@angular/router';
import {MatAutocompleteModule, MatProgressSpinnerModule, MatSlideToggleModule} from '@angular/material';
import {AutoSelectModule} from '../../../../components/auto-select/auto-select.module';
import {MerchantsTagManagementExportModule} from '../../tag-management/merchants-tag-management/merchants-tag-management-export.module';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';


@NgModule({
    declarations: [
        EditStoreComponent
    ],
    imports: [
        RootModule,
        MatProgressSpinnerModule,
        AutoSelectModule,
        MaterialDatePickerModule,
        MerchantsTagManagementExportModule,
        MatAutocompleteModule,
        RouterModule.forChild([{path: '**', component: EditStoreComponent}]),
        MatSlideToggleModule
    ]
})
export class EditStoreModule {
}
