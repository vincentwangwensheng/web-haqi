import {NgModule} from '@angular/core';
import {EditMallComponent} from './edit-mall.component';
import {RootModule} from '../../../../root.module';
import {RouterModule} from '@angular/router';
import {
    MatAutocompleteModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
} from '@angular/material';
import {AutoSelectModule} from '../../../../components/auto-select/auto-select.module';


@NgModule({
    declarations: [
        EditMallComponent
    ],
    imports: [
        RootModule,
        MatAutocompleteModule,
        AutoSelectModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        RouterModule.forChild([{path: '**', component: EditMallComponent}])
    ]
})
export class EditMallModule {
}
